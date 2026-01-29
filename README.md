# 🇾🇪 YemenJPT Digital Platform (V18.2 - CPU Compatible Edition)

**YemenJPT (Yemen Journalist Pre-trained Transformer)** is a self-hosted, integrated digital ecosystem designed specifically to empower journalists and media organizations in Yemen. The platform enhances press freedom by providing a secure, sovereign environment and a comprehensive suite of tools for Open Source Intelligence (OSINT), information verification, data analysis, and collaborative journalistic work.

This document serves as the primary technical guide for deploying and managing the YemenJPT platform.

---

## ✨ 1. Vision & Core Features

The platform is an all-in-one digital workspace providing critical capabilities for the modern investigative journalist. It is built on the principle of **data sovereignty**, allowing the entire system to run on private infrastructure, ensuring sensitive data never transits through third-party services. A key security feature is the **"Digital Chameleon" panic mode**, allowing an administrator to instantly switch the main application entry point to a decoy website in an emergency.

### Core Platform Modules

| Category                    | Tools & Features                                                                                        | Purpose for Journalists                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Cognitive Core (AI)**     | `Ollama`, `Open WebUI`, `Qdrant`, `Langfuse`, `LibreTranslate`, `Whisper WebUI` | Accelerates research, transcribes interviews, provides a feedback mechanism for AI improvement, and enables secure translation. |
| **Investigation & OSINT**   | `SearXNG`, `SpiderFoot`, `ChangeDetection.io`, `ArchiveBox`, `Social-Analyzer`          | Gathers intelligence, automates reconnaissance, tracks website changes, and creates permanent web archives.      |
| **Media Verification**      | `Meedan Check`                                                            | Fights misinformation by providing a robust toolkit to verify the authenticity of images, videos, and claims.     |
| **Collaboration & Workflow**| `Mattermost`, `Nextcloud`, `Webtop`, `n8n` (Automation)                            | Streamlines teamwork, allowing for secure communication, task management, isolated browsing, and workflow automation. |
| **System & Identity**       | `Keycloak` (SSO), `Vaultwarden` (Passwords), `Portainer`, `Glances`, `Uptime Kuma` | Manages user identity, secures passwords, and provides tools for system monitoring and container management. |
| **Organizational Mgmt.**    | `CiviCRM`, `TYPO3` (CMS), `Gitea`, Dashy Portals                                                                   | Manages contacts, powers the public website, hosts code, and provides role-based dashboards for users. |
| **Security**                | Cloudflare Tunnel, Internal Nginx Proxy (Digital Chameleon)                                             | Secures the entire platform without opening server ports and provides an emergency decoy mechanism.               |

---

## 🏗️ 2. Architecture Overview

The application is built on a modern, containerized architecture designed for security, portability, and ease of management.

-   **Gateway**: **Cloudflare Tunnel** acts as the single, secure entry point. It connects the internal services to the Cloudflare network without exposing any public ports on the server.
-   **Orchestration**: The entire stack is managed via **Docker Compose**, defining all services, volumes, and networks in a single, declarative file.
-   **Application**: An **Angular** frontend (`yemenjpt_app`) and a **Node.js** backend (`backend`) provide the main user interface and API layer.
-   **AI Services**: **Ollama** and **Whisper** run on the server's CPU, providing local AI capabilities. Performance will vary based on the server's CPU resources.
-   **Databases**: **PostgreSQL** and **MariaDB** serve as robust, persistent data stores for the various platform services.
-   **Identity**: **Keycloak** acts as a central Identity and Access Management (IAM) provider for Single Sign-On (SSO).
-   **Internal Proxy & Decoy**: A dedicated **Nginx** container (`internal_proxy`) is the key component of the "Digital Chameleon" panic mode, allowing it to dynamically switch traffic between the real frontend and a harmless decoy site.
-   **Dashboards**: **Dashy** is used to create role-specific portals, providing a unified user experience.

---

## 🚀 3. Deployment Guide

This guide is for deploying the platform on a fresh **Ubuntu 24.04 LTS** server.

### 3.1. Prerequisites

1.  **Server**: A fresh Ubuntu 24.04 LTS server with root access. A server without a dedicated GPU is sufficient.
2.  **Domain Name**: A domain you own (e.g., `ph-ye.org`).
3.  **Cloudflare Account**: A free Cloudflare account managing your domain's DNS. You need to have a Cloudflare Tunnel configured.
4.  **Git**: `git` command-line tool installed (`sudo apt install git`).

### 3.2. Automated Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/YemenJPT-Platform.git
    cd YemenJPT-Platform
    ```

2.  **Configure Environment File (`.env`)**
    This is the most critical step. Copy the example file and fill out all required values using a text editor like `nano`.
    ```bash
    cp .env.example .env
    nano .env
    ```
    -   **`DOMAIN`**: Your main domain (e.g., `ph-ye.org`).
    -   **`CLOUDFLARE_TUNNEL_TOKEN`**: The token for your Cloudflare Tunnel.
    -   **Passwords**: Use a password manager to generate strong, unique passwords for `UNIFIED_PASS`, `MARIADB_ROOT_PASSWORD`, `POSTGRES_PASSWORD`, `TYPO3_DB_PASS`, and `CIVICRM_DB_PASS`.

3.  **Run the Installation Script**
    Make the script executable and run it as root. It will automate the entire setup process.
    ```bash
    chmod +x install.sh
    sudo ./install.sh
    ```
    The script will:
    -   Install Docker and Docker Compose.
    -   Create all necessary data directories under `/opt/presshouse`.
    -   Copy all configuration files and the backend source code to `/opt/presshouse`.
    -   Copy the `panic.sh` and `secure.sh` scripts and make them executable.
    -   Launch all services via Docker Compose.
    -   Configure the firewall (UFW) to only allow SSH traffic.

### 3.3. Accessing the Application

After the script finishes, all services will be running securely.
-   **Main Application**: `https://ai.your-domain.com`
-   **Journalist Portal**: `https://portal.your-domain.com`
-   **Admin Portal**: `https://sys.your-domain.com`
-   **AI Interface**: `https://ai-ui.your-domain.com`
-   **Team Chat**: `https://chat.your-domain.com`
-   **Secure Files**: `https://files.your-domain.com`
-   **Identity Provider**: `https://auth.your-domain.com`
-   **Public CMS**: `https://cms.your-domain.com`
-   **Container Manager**: `https://portainer.your-domain.com`
-   **System Monitoring**: `https://glances.your-domain.com`
-   **Service Status**: `https://status.your-domain.com`

---

## 🛡️ 4. Security: Digital Chameleon (Panic Mode)

The "Digital Chameleon" feature allows an administrator to instantly switch the main entry point of the application (`ai.your-domain.com`) to a simple, static decoy page.

-   **To Activate Panic Mode**:
    ```bash
    sudo /opt/presshouse/panic.sh
    ```
-   **To Restore Normal (Secure) Mode**:
    ```bash
    sudo /opt/presshouse/secure.sh
    ```

---

## 🔧 5. Maintenance & Operations

All operational commands should be run from the main application directory.

-   **Updating the Application**: To apply updates from the Git repository:
    ```bash
    git pull
    sudo ./deploy.sh
    ```
-   **Viewing Logs**: To see real-time logs from all running services:
    ```bash
    cd /opt/presshouse && sudo docker compose logs -f
    ```
-   **Stopping the Application**:
    ```bash
    cd /opt/presshouse && sudo docker compose down
    ```
-   **Starting the Application**:
    ```bash
    cd /opt/presshouse && sudo docker compose up -d
    ```
-   **Backups**: All persistent data is stored in subdirectories within `/opt/presshouse/data`. You must implement a regular backup strategy for this entire directory.

---

## 🔍 6. Troubleshooting

-   **Problem: Services are not starting or are in a restart loop.**
    -   **Solution**: Check the logs (`sudo docker compose -f /opt/presshouse/docker-compose.yml logs -f <service_name>`). Common issues include incorrect passwords in the `.env` file or services failing their healthchecks. Wait for the databases to become healthy first.
-   **Problem: Domains are not accessible.**
    -   **Solution**:
        1.  Verify your domain's nameservers are pointing to Cloudflare.
        2.  Check the status of your tunnel in the Cloudflare Zero Trust dashboard.
        3.  Check the `cloudflared` service logs for token errors: `sudo docker logs ph-gateway-tunnel`.
-   **Problem: A specific service is not working (e.g., `chat.your-domain.com`).**
    -   **Solution**: Check the logs for that specific service (e.g., `sudo docker logs ph-mattermost`). The issue is often related to incorrect database credentials defined in the `.env` file.
---

## 🧠 7. Model Context Protocol (MCP) Implementation

The core of YemenJPT's intelligence is the **Model Context Protocol (MCP)**, a "Chat-to-Action" orchestration layer implemented within the Angular frontend. It enables the AI to understand user requests in natural language and trigger the appropriate specialized tools on the platform.

### 7.1. Architectural Flow

The MCP follows this client-side workflow:

1.  **User Input**: A journalist types a command into the "AI Core" chat interface (e.g., *"Find social media accounts for 'user123' and then archive the results"*).

2.  **Context Assembly (Frontend)**: Before sending the prompt to the AI (Google Gemini), the Angular application dynamically assembles a rich context:
    *   **System Prompt**: A detailed instruction set is generated, defining the AI's role as an OSINT assistant, its personality, and the rules for tool usage. This can be configured by admins in the LLMOps dashboard.
    *   **Tool Manifest**: The application filters the master list of 35+ tools based on the current user's role (RBAC). A manifest of allowed tools, including their IDs, names, and descriptions, is generated.
    *   **Function Definition**: This manifest is converted into a formal `function_declaration` that is sent to the Gemini API. The primary function defined is `run_tool(toolId: string)`.

3.  **AI Deliberation (Gemini)**: The Gemini model receives the user's prompt along with the system prompt and the list of available tools it can "call." It understands that its primary job is not to answer directly but to orchestrate. Based on the user's request, it determines that the `Sherlock` tool is the most appropriate and decides to call `run_tool(toolId: 'sherlock-maigret')`.

4.  **Function Call Response**: Instead of returning a text answer, the Gemini API returns a `functionCall` object in its response, instructing the frontend to execute the specified function with the given arguments.

5.  **Frontend Execution**: The Angular application receives the `functionCall` response.
    *   It identifies the requested `toolId`.
    *   It logs the action to the **Audit Log** for security and oversight.
    *   It uses its internal state management to "run" the tool, which involves opening the `Sherlock` tool's interface as a new tab on the main dashboard. This simulates an asynchronous background task.
    *   It provides feedback in the chat interface, such as *"Understood. Opening the Sherlock tool..."*.

### 7.2. Code Example: Tool Definition (Angular/TypeScript)

The MCP tool definition is generated dynamically in `src/components/ai-core/ai-core.component.ts`. The following `computed` signal creates the schema that is sent to the Gemini API on every request.

```typescript
// src/components/ai-core/ai-core.component.ts

import { Tool as GeminiTool, Type } from '@google/genai';

// ...

export class AiCoreComponent {
  // ... other component code

  // Computed signal to generate tool schema for Gemini
  geminiTools = computed((): GeminiTool[] | undefined => {
    // 1. Get a list of tools the current user is allowed to access.
    const allowedTools = this.getAllToolsForAI();
    if (!allowedTools.length) return undefined;

    // 2. Define the 'run_tool' function the AI can call.
    return [{
        functionDeclarations: [
            {
                name: 'run_tool',
                description: 'Runs a specialized tool available on the YemenJPT platform. Use this to open tools for analysis, investigation, or other tasks when requested by the user.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        toolId: {
                            type: Type.STRING,
                            description: 'The unique ID of the tool to run.',
                            // 3. Dynamically populate the list of allowed tool IDs.
                            enum: allowedTools.map(t => t.id)
                        }
                    },
                    required: ['toolId'],
                },
            },
        ],
    }];
  });

  // ... rest of component
}
```

This implementation creates a powerful, context-aware, and secure orchestration system directly within the client, fulfilling the core vision of the YemenJPT platform.