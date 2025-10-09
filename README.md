# FedLearn

FedLearn is a federated learning platform designed to facilitate collaborative machine learning without the need for centralizing sensitive user data. It enables multiple clients to collaboratively train a shared global model while keeping their data local.

## How it Works

The platform consists of an Electron-based desktop application and a client-side Python script. The Electron app, built with React, provides the user interface, while the Python script handles the local model training. Clients download the global model, train it on their local datasets, and then send the updated model weights back to the server.

The backend, powered by Express.js and MongoDB, receives these trained models from various clients. It then aggregates the model weights using federated learning techniques, such as federated averaging, to create a new, improved global model. This updated global model is then distributed back to the clients for the next round of training.

## Tech Stack

- **Frontend:** Electron, React
- **Backend:** Express.js, MongoDB
- **Federated Learning:** TensorFlow

## Demo

https://github.com/user-attachments/assets/8649f5e7-4a32-47de-88a4-2ccfca5cc712

