# Federated Learning Platform

This project is a federated learning platform that allows for collaborative model training across multiple devices or servers.

## Server

The server directory contains the following files:

- `init.py`: This script reads values from the `config.txt` file and initializes the required network with random weights. The weights are then stored in the `model.h2` file.

- `contribution.py`: This script reads weights from a file, uses federated learning (specifically, FedAvg) to combine the model with the existing model, and saves the updated model, replacing the old model.

- `config.txt`: This file contains the configuration values for the federated learning platform, such as the activation function, dropout rate, combining method, input shape, number of layers, and units per layer.

- `model.h2`: This file stores the weights of the initialized network.

## Client

The client directory is currently empty. It can be used for future client-side scripts or components.

For more information on how to use this federated learning platform, please refer to the documentation provided in the respective script files.

```

Note: The README.md file provides an overview of the project structure and briefly describes the purpose of each file in the server directory. It also mentions that the client directory is currently empty and can be used for future client-side scripts or components.