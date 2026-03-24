# PulseDesk — Comment-to-Ticket Triage

A Spring Boot backend application that collects user comments and uses AI (Hugging Face) to automatically decide whether a comment should become a support ticket — and if so, generates structured ticket data including a title, category, priority, and summary.

Built as part of the IBM Internship Technical Challenge.

---

## How It Works

1. A user submits a comment via `POST /comments`
2. The comment is saved to an in-memory H2 database
3. The app calls the Hugging Face Inference API (Qwen3-8B model) to decide if the comment describes a real issue
4. If yes, a second AI call generates a structured ticket with title, category, priority, and summary
5. The ticket is saved and available via `GET /tickets`

---

## Tech Stack

- Java 17
- Spring Boot
- Spring Data JPA
- H2 (in-memory embedded database)
- Hugging Face Inference API (`Qwen/Qwen3-8B` via Novita provider)

---

## AI Model

This project uses **`Qwen/Qwen3-8B`** via the Hugging Face Inference Router.

> **Why not the suggested models?**
> The task suggested `google/flan-t5-base`, `tiiuae/falcon-7b-instruct`, and `mistralai/Mistral-7B-Instruct`.
> - `tiiuae/falcon-7b-instruct` — returns `410 Gone`, the old `api-inference.huggingface.co` endpoint is permanently deprecated
> - `google/flan-t5-base` — has no active Inference Provider on the new router
> - `mistralai/Mistral-7B-Instruct-v0.3` — gated model requiring individual agreement per user, which would make it hard for others to run the project
>
> `Qwen/Qwen3-8B` is fully open, ungated, and available on the free tier — anyone can run this project with just a standard HuggingFace token.

---

## Setup Instructions

### Prerequisites

- Java 17+
- Maven
- A free [Hugging Face](https://huggingface.co) account

### 1. Clone the repository

```bash
git https://github.com/DeimanteDav/pulsedesk.git
cd pulsedesk
```

### 2. Create a Hugging Face token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"Create new token"**
3. Select type **"Fine-grained"**
4. Enable **"Make calls to Inference Providers"**
5. Copy the token

### 3. Configure the application

Set your token as an environment variable:

```bash
# Windows
set HF_TOKEN=hf_xxxxxxxxxxxxxxxx

# Mac/Linux
export HF_TOKEN=hf_xxxxxxxxxxxxxxxx
```

Or set it directly in IntelliJ: **Run → Edit Configurations → Environment Variables**

### 4. Run the application

```bash
./mvnw spring-boot:run
```

The app starts at `http://localhost:8080`

---

## API Endpoints

### Submit a comment
```
POST /comments
Content-Type: application/json

{
  "text": "The app crashes every time I try to log in"
}
```

### Get all comments
```
GET /comments
```

### Get all tickets
```
GET /tickets
```

### Get a ticket by ID
```
GET /tickets/{id}
```

---

## Example

**Request:**
```bash
curl -X POST http://localhost:8080/comments \
  -H "Content-Type: application/json" \
  -d '{"text": "App crashes when clicking login"}'
```

**Auto-generated ticket (from `GET /tickets`):**
```json
{
  "id": 1,
  "title": "App crashes on login click",
  "category": "bug",
  "priority": "high",
  "summary": "The application crashes when the user attempts to click the login button."
}
```

**No ticket created for compliments:**
```bash
curl -X POST http://localhost:8080/comments \
  -H "Content-Type: application/json" \
  -d '{"text": "Great app, love the new design!"}'
```

---

## H2 Database Console

You can inspect the in-memory database at:
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (leave blank)
```

---

## Project Structure

```
src/main/java/com/deimante/pulsedesk/
├── controller/
│   ├── CommentController.java   # POST /comments, GET /comments
│   └── TicketController.java    # GET /tickets, GET /tickets/{id}
├── model/
│   ├── Comment.java
│   └── Ticket.java
├── repository/
│   ├── CommentRepository.java
│   └── TicketRepository.java
└── service/
    ├── CommentService.java       # Orchestrates comment processing
    └── HuggingFaceService.java   # AI API calls (triage + ticket generation)
```
