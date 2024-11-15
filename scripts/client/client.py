import argparse
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import hashlib
import json

def main(projectname, epochs):
    try:
        # Define paths
        project_dir = os.path.join("projects", projectname)
        contrib_dir = os.path.join(project_dir, "contrib")
        model_config_path = os.path.join(project_dir, "model_config.json")
        model_weights_path = os.path.join(project_dir, "model.weights.h5")
        training_data_dir = "training_data"

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

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the model and save weights")
    parser.add_argument("projectname", type=str, help="Project directory name")
    parser.add_argument("epochs", type=int, help="Number of epochs to train")

    args = parser.parse_args()
    main(args.projectname, args.epochs)