import argparse
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json

def main(username, projectname):
    try:
        # Define paths
        project_dir = os.path.join("users", username, projectname)
        test_set_dir = os.path.join(project_dir, "test_set")
        model_config_path = os.path.join(project_dir, "model_config.json")
        model_weights_path = os.path.join(project_dir, "model.weights.h5")
        accuracy_file_path = os.path.join(project_dir, "accuracy.txt")

        print(f"Project directory: {project_dir}")
        print(f"Test set directory: {test_set_dir}")
        print(f"Model config path: {model_config_path}")
        print(f"Model weights path: {model_weights_path}")
        print(f"Accuracy file path: {accuracy_file_path}")

        # Validate paths
        if not os.path.exists(model_config_path):
            print(f"Error: Model configuration file not found at {model_config_path}.")
            return

        if not os.path.exists(model_weights_path):
            print(f"Error: Model weights file not found at {model_weights_path}.")
            return

        if not os.path.exists(test_set_dir):
            print(f"Error: Test set directory not found at {test_set_dir}.")
            return

        # Load model configuration
        with open(model_config_path, 'r') as json_file:
            model_json = json_file.read()
        model = tf.keras.models.model_from_json(model_json)
        print("Loaded model configuration from JSON.")

        # Load model weights
        model.load_weights(model_weights_path)
        print(f"Loaded model weights from {model_weights_path}.")

        # Prepare test data
        input_shape = model.input_shape[1:]  # Exclude batch dimension
        print(f"Model input shape: {input_shape}")

        # Determine color mode based on input shape
        if len(input_shape) == 2:
            img_height, img_width = input_shape
            color_mode = 'grayscale'
        elif len(input_shape) == 3:
            img_height, img_width, channels = input_shape
            if channels == 1:
                color_mode = 'grayscale'
            elif channels == 3:
                color_mode = 'rgb'
            else:
                raise ValueError(f"Unsupported number of channels: {channels}")
        else:
            raise ValueError(f"Invalid input shape: {input_shape}")

        print(f"Using color mode: {color_mode}")
        print(f"Image target size: ({img_height}, {img_width})")

        # Create ImageDataGenerator for loading test images
        datagen = ImageDataGenerator(rescale=1./255)

        test_generator = datagen.flow_from_directory(
            test_set_dir,
            target_size=(img_height, img_width),
            batch_size=32,
            class_mode='categorical',
            color_mode=color_mode,
            shuffle=False
        )
        print("Initialized ImageDataGenerator and test generator.")

        # Compile the model
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        print("Compiled the model.")

        # Evaluate the model
        print("Starting evaluation on the test set...")
        loss, accuracy = model.evaluate(test_generator)
        print(f"Evaluation completed. Accuracy: {accuracy * 100:.2f}%")

        # Write accuracy to accuracy.txt
        with open(accuracy_file_path, 'w') as acc_file:
            acc_file.write(f"{accuracy * 100:.2f}%\n")
        print(f"Saved accuracy to {accuracy_file_path}.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the model and save accuracy")
    parser.add_argument("username", type=str, help="Username directory")
    parser.add_argument("projectname", type=str, help="Project directory")

    args = parser.parse_args()
    main(args.username, args.projectname)