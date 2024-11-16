from flask import Flask, request, jsonify
import os
import shutil
import zipfile
import hashlib
import requests
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from flask_cors import CORS
import json
from requests_toolbelt import MultipartEncoder, MultipartEncoderMonitor
from tqdm import tqdm

app = Flask(__name__)
CORS(app)

def main(projectname, epochs):
    try:
        # Define paths
        project_dir = os.path.join("projects", projectname)
        contrib_dir = os.path.join(project_dir, "contrib")
        model_config_path = os.path.join(project_dir, "model_config.json")
        model_weights_path = os.path.join(project_dir, "model.weights.h5")
        training_data_dir = os.path.join(project_dir, "training_data")

        print(f"Project directory: {project_dir}")
        print(f"Contrib directory: {contrib_dir}")
        print(f"Model config path: {model_config_path}")
        print(f"Model weights path: {model_weights_path}")
        print(f"Training data directory: {training_data_dir}")

        # Ensure contrib directory exists
        os.makedirs(contrib_dir, exist_ok=True)
        print("Ensured that contrib directory exists.")

        # Load model configuration
        if not os.path.exists(model_config_path):
            print(f"Model configuration file not found at {model_config_path}.")
            return

        with open(model_config_path, 'r') as json_file:
            model_json = json_file.read()
        model = tf.keras.models.model_from_json(model_json)
        print("Loaded model configuration from JSON.")

        # Load model weights if they exist
        if os.path.exists(model_weights_path):
            model.load_weights(model_weights_path)
            print(f"Loaded existing model weights from {model_weights_path}.")
        else:
            print(f"No existing weights found at {model_weights_path}. Training from scratch.")

        # Prepare training data
        input_shape = model.input_shape[1:]  # Exclude batch dimension
        print(f"Model input shape: {input_shape}")

        # Determine color mode based on input shape
        if len(input_shape) == 2:
            img_height, img_width = input_shape
            color_mode = 'grayscale'
        elif len(input_shape) == 3:
            img_height, img_width, channels = input_shape
            color_mode = 'rgb' if channels == 3 else 'grayscale'
        else:
            raise ValueError(f"Invalid input shape: {input_shape}")

        print(f"Using color mode: {color_mode}")
        print(f"Image target size: ({img_height}, {img_width})")

        # Create ImageDataGenerator for loading images
        datagen = ImageDataGenerator(rescale=1./255)

        train_generator = datagen.flow_from_directory(
            training_data_dir,
            target_size=(img_height, img_width),
            batch_size=32,
            class_mode='categorical',
            color_mode=color_mode
        )
        print("Initialized ImageDataGenerator and train generator.")

        # Compile the model
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        print("Compiled the model.")

        # Train the model
        print(f"Starting training for {epochs} epochs...")
        model.fit(train_generator, epochs=epochs)
        print("Training completed.")

        # Save the model weights to a temporary file
        temp_weights_path = os.path.join(contrib_dir, 'temp.weights.h5')
        model.save_weights(temp_weights_path)
        print(f"Saved temporary weights to {temp_weights_path}.")

        # Compute SHA1 hash of the weights file
        sha1 = hashlib.sha1()
        with open(temp_weights_path, 'rb') as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                sha1.update(chunk)
        hash_hex = sha1.hexdigest()
        print(f"Computed SHA1 hash: {hash_hex}")

        # Rename the weights file with the SHA1 hash
        final_weights_filename = f"{hash_hex}.weights.h5"
        final_weights_path = os.path.join(contrib_dir, final_weights_filename)
        os.rename(temp_weights_path, final_weights_path)
        print(f"Renamed weights file to {final_weights_filename} and saved at {final_weights_path}.")

        return hash_hex

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.route('/train', methods=['POST'])
def train():
    try:
        # Validate request contains required file
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Get and validate form data
        token = request.form.get('token')
        server_url = request.form.get('url')  # This should be like http://localhost:3000
        project_name = request.form.get('projectName')
        epochs = int(request.form.get('epochs', 1))

        if not all([token, server_url, project_name]):
            return jsonify({'error': 'Missing required fields (token, url, or projectName)'}), 400

        # Remove any trailing slashes from the server URL
        server_url = server_url.rstrip('/')

        # Define directory paths
        project_dir = os.path.join("projects", project_name)
        contrib_dir = os.path.join(project_dir, "contrib")
        training_data_dir = os.path.join(project_dir, "training_data")
        model_config_path = os.path.join(project_dir, "model_config.json")

        # Create project directory if it doesn't exist
        if not os.path.exists(project_dir):
            os.makedirs(project_dir, exist_ok=True)
            os.makedirs(contrib_dir, exist_ok=True)
            print(f"Created project directory: {project_dir}")

            # Get model config JSON
            config_url = f"{server_url}/{project_name}/json"
            headers = {'Authorization': f'Bearer {token}'}
            
            print(f"Fetching model config from: {config_url}")
            response = requests.get(config_url, headers=headers)
            
            if response.status_code != 200:
                return jsonify({
                    'error': f'Failed to download model_config.json. Status: {response.status_code}',
                    'details': response.text
                }), response.status_code

            # Save model config
            with open(model_config_path, 'w') as f:
                f.write(response.text)
            print(f"Downloaded and saved model_config.json to {model_config_path}")

        # Clean up existing directories
        if os.path.exists(contrib_dir):
            shutil.rmtree(contrib_dir)
        os.makedirs(contrib_dir, exist_ok=True)
        print("Reset contrib directory")

        # Create temporary directory for extraction
        temp_extract_dir = os.path.join(project_dir, "temp_extract")
        if os.path.exists(temp_extract_dir):
            shutil.rmtree(temp_extract_dir)
        os.makedirs(temp_extract_dir)

        try:
            # Extract zip file to temp directory
            with zipfile.ZipFile(file, 'r') as zip_ref:
                zip_ref.extractall(temp_extract_dir)
            print("Extracted zip file successfully")

            # Find the actual data directory (it should contain class folders)
            extracted_contents = os.listdir(temp_extract_dir)
            if len(extracted_contents) == 1:  # If there's only one item in the extracted folder
                nested_dir = os.path.join(temp_extract_dir, extracted_contents[0])
                if os.path.isdir(nested_dir):  # If it's a directory
                    # Remove existing training_data directory if it exists
                    if os.path.exists(training_data_dir):
                        shutil.rmtree(training_data_dir)
                    
                    # Rename the nested directory to training_data
                    shutil.move(nested_dir, training_data_dir)
                    print("Moved nested directory to training_data")
            else:
                # If structure is different than expected, just move the temp directory
                if os.path.exists(training_data_dir):
                    shutil.rmtree(training_data_dir)
                shutil.move(temp_extract_dir, training_data_dir)
                print("Moved extracted contents to training_data")

        except Exception as e:
            if os.path.exists(temp_extract_dir):
                shutil.rmtree(temp_extract_dir)
            raise Exception(f"Failed to process zip file: {str(e)}")
        finally:
            # Clean up temp directory if it still exists
            if os.path.exists(temp_extract_dir):
                shutil.rmtree(temp_extract_dir)

        # Run training
        result_hash = main(project_name, epochs)
        if not result_hash:
            return jsonify({'error': 'Training failed'}), 500

        # Prepare to send the model file to Express server
        model_file_path = os.path.join(contrib_dir, f"{result_hash}.weights.h5")
        if not os.path.exists(model_file_path):
            return jsonify({'error': 'Model file not found after training'}), 500

        # Prepare the form fields and files
        form_data = {
            'sha1': result_hash,
            'file': ('model.h5', open(model_file_path, 'rb'), 'application/octet-stream')
        }

        # Create MultipartEncoder
        encoder = MultipartEncoder(fields=form_data)

        # Create a progress bar
        progress = tqdm(total=encoder.len, unit='B', unit_scale=True, desc='Uploading')

        # Callback function to update progress bar
        def progress_callback(monitor):
            progress.update(monitor.bytes_read - progress.n)

        # Create MultipartEncoderMonitor
        encoder_monitor = MultipartEncoderMonitor(encoder, progress_callback)

        # Set the headers
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': encoder.content_type
        }

        # Construct the contribution URL
        contribution_url = f"{server_url}/{project_name}/contribute"

        print(f"Uploading model to: {contribution_url}")
        # Make the request to the Express server
        try:
            response = requests.post(
                contribution_url,
                data=encoder_monitor,
                headers=headers
            )
            progress.close()
            if response.status_code != 200:
                return jsonify({
                    'error': f'Failed to upload model to server. Status: {response.status_code}',
                    'server_response': response.text
                }), response.status_code
        except Exception as e:
            print(f"An error occurred: {e}")
            progress.close()
            return jsonify({'error': str(e)}), 500

        return jsonify({
            'hash': result_hash,
            'message': 'Training and upload successful'
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)