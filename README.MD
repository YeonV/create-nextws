# create-nextws

[![docs](https://img.shields.io/badge/React-React-blue.svg?logo=React&logoColor=white&label=)](https://reactjs.org/) [![docs](https://img.shields.io/badge/React-TypeScript-blue.svg?logo=TypeScript&logoColor=white&label=)](https://www.typescriptlang.org/) [![docs](https://img.shields.io/badge/React-MaterialUI-blue.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDM2IDMyIiBmaWxsPSJub25lIiBjbGFzcz0iY3NzLTExNzBuNjEiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMzQzIDIxLjk3NmExIDEgMCAwMC41MDItLjg2NGwuMDE4LTUuNzg3YTEgMSAwIDAxLjUwMi0uODY0bDMuMTM3LTEuODAyYTEgMSAwIDAxMS40OTguODY3djEwLjUyMWExIDEgMCAwMS0uNTAyLjg2N2wtMTEuODM5IDYuOGExIDEgMCAwMS0uOTk0LjAwMWwtOS4yOTEtNS4zMTRhMSAxIDAgMDEtLjUwNC0uODY4di01LjMwNWMwLS4wMDYuMDA3LS4wMS4wMTMtLjAwNy4wMDUuMDAzLjAxMiAwIC4wMTItLjAwN3YtLjAwNmMwLS4wMDQuMDAyLS4wMDguMDA2LS4wMWw3LjY1Mi00LjM5NmMuMDA3LS4wMDQuMDA0LS4wMTUtLjAwNC0uMDE1YS4wMDguMDA4IDAgMDEtLjAwOC0uMDA4bC4wMTUtNS4yMDFhMSAxIDAgMDAtMS41LS44N2wtNS42ODcgMy4yNzdhMSAxIDAgMDEtLjk5OCAwTDYuNjY2IDkuN2ExIDEgMCAwMC0xLjQ5OS44NjZ2OS40YTEgMSAwIDAxLTEuNDk2Ljg2OWwtMy4xNjYtMS44MWExIDEgMCAwMS0uNTA0LS44N2wuMDI4LTE2LjQzQTEgMSAwIDAxMS41MjcuODZsMTAuODQ1IDYuMjI5YTEgMSAwIDAwLjk5NiAwTDI0LjIxLjg2YTEgMSAwIDAxMS40OTguODY4djE2LjQzNGExIDEgMCAwMS0uNTAxLjg2N2wtNS42NzggMy4yN2ExIDEgMCAwMC4wMDQgMS43MzVsMy4xMzIgMS43ODNhMSAxIDAgMDAuOTkzLS4wMDJsNi42ODUtMy44Mzl6TTMxIDcuMjM0YTEgMSAwIDAwMS41MTQuODU3bDMtMS44QTEgMSAwIDAwMzYgNS40MzRWMS43NjZBMSAxIDAgMDAzNC40ODYuOTFsLTMgMS44YTEgMSAwIDAwLS40ODYuODU3djMuNjY4eiIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg==&logoColor=white&label=)](mui.com) [![docs](https://img.shields.io/badge/React-Zustand-blue.svg?logo=data:image/png;base64,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&logoColor=white&label=)](https://github.com/pmndrs/zustand)


---
Scaffolding NextJS + NextWS + Strapi, Dockerized

---


## Feature of the app stack

1. **Web**: A Next.js 14 project utilizing the new app router and server actions/components.
2. **API**: A Strapi 4.22 project that serves as the backend.
3. **WS**: A NextWS route for NextJS internal client-server communication.


## usage


### Initialize

```sh
npx create nextws@latest
# or with NPM:
npm create nextws@latest
#or with Yarn
yarn create nextws
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
