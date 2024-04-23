# create-nextws

---
Scaffolding NextJS + NextWS + Strapi -- Dockerized

---


## Feature of the app stack

1. **Web**: A Next.js 14 project utilizing the new app router and server actions/components.
2. **API**: A Strapi 4.22 project that serves as the backend.
3. **WS**: A NextWS route for NextJS internal client-server communication.


## usage


### Initialize

```sh
npx create-nextws@latest
# or with NPM:
npm create-nextws@latest
#or with Yarn
yarn create-nextws
```


## Quickstart

Enter a name, and confirm automatic mode

![image](https://github.com/YeonV/create-nextws/assets/28861537/1d0b0d58-18a4-4633-bc16-07036fac8ca5)

![image](https://github.com/YeonV/create-nextws/assets/28861537/8d1c596f-ac46-45aa-baf9-bfccd39dcadb)

## Custom Configuration

Enter a name, and deny automatic mode

You can then set any environment variable including PORTs and also all docker compose service names.

If secret keys are ommited, they will be generated. 

*careful*: generation is random. so if you delete the project and rerun the create command,
you will get new generated keys! (you have to backup your keys on your own if you need them later)

![image](https://github.com/YeonV/create-nextws/assets/28861537/9de7dbbe-a380-4e12-8e70-b01b639f883a)


## Features of the create-nextws

1. **Command Line Interface**: This project provides a command line interface for easy interaction. It supports arguments like `--help`, `--docs`, and `--version`.

2. **Docker Integration**: The project checks if Docker is running on the system and can operate in a 'lite' mode if Docker is not available.

3. **Project Scaffolding**: It prompts the user for project details and scaffolds a new project based on the user's input.

4. **Customization**: The user can customize various aspects of the project such as whether to auto-generate `.env` files, and whether to customize compose service names.

5. **Environment Configuration**: The project supports the generation and copying of `.env` files based on user preferences.

6. **Docker Compose Configuration**: If Docker is available, the project can configure Docker Compose and start Docker containers.

7. **Documentation**: After the project is set up, it displays documentation to the user.

---

[![creator](https://img.shields.io/badge/CREATOR-Yeon-blue.svg?logo=github&logoColor=white)](https://github.com/YeonV) [![creator](https://img.shields.io/badge/A.K.A-Blade-darkred.svg?logo=github&logoColor=white)](https://github.com/YeonV)
