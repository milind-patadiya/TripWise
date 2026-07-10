# TripWise Architecture & Diagrams

Copy these Mermaid.js diagrams directly into any markdown viewer or rendering tool to generate the visual graphs for your final project report.

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client [Frontend - React Vite]
        UI[User Interface]
        State[Zustand State Manager]
        Query[Tanstack React Query]
        API_Client[Axios Client]
    end

    subgraph Server [Backend - Node.js/Express]
        Router[Express Router]
        Auth[JWT Middleware]
        PlannerController[AI Planner Controller]
        WeatherController[Weather Proxy Controller]
        DBController[Mongoose Models]
    end

    subgraph External Services
        Gemini[Google Gemini API]
        Meteo[Open-Meteo Weather API]
        Database[(MongoDB)]
    end

    %% Flow
    UI --> State
    UI --> Query
    Query --> API_Client
    
    API_Client -->|HTTP/REST| Router
    Router --> Auth
    Auth --> PlannerController
    Auth --> WeatherController
    Auth --> DBController
    
    PlannerController -->|Generate Itinerary| Gemini
    WeatherController -->|Fetch Climate| Meteo
    DBController <-->|CRUD Data| Database
```

## 2. User Flowchart

```mermaid
flowchart TD
    Start([User Visits Website]) --> HasAccount{Has Account?}
    HasAccount -->|No| Register[Register User]
    HasAccount -->|Yes| Login[Login via JWT]
    
    Register --> Login
    Login --> Dashboard[View User Dashboard]
    
    Dashboard --> Action{Choose Action}
    
    Action -->|Plan Trip| Setup[Enter Source, Dest, Days, Budget]
    Setup --> FetchAI[Call AI API]
    FetchAI --> Wait{Success?}
    Wait -->|Yes| DisplayItinerary[Show Day-by-Day Itinerary]
    Wait -->|No| Fallback[Trigger Smart Fallback Engine]
    Fallback --> DisplayItinerary
    
    DisplayItinerary --> SaveOrExport{Next Step}
    SaveOrExport -->|Export| PDF[Generate client-side PDF]
    SaveOrExport -->|Save| DB[(Save to MongoDB)]
    
    Action -->|View Weather| Weather[Fetch Weather Proxy]
    Action -->|View Destinations| Dest[Browse MongoDB Destinations]
```

## 3. Use Case Diagram

```mermaid
usecase
actor "Traveler (User)" as U
actor "System Admin" as A

rectangle TripWise {
  usecase "Register/Login" as UC1
  usecase "Generate AI Trip" as UC2
  usecase "View Weather" as UC3
  usecase "Export PDF Itinerary" as UC4
  usecase "Manage Destinations" as UC5
  usecase "View System Metrics" as UC6
}

U --> UC1
U --> UC2
U --> UC3
U --> UC4

A --> UC1
A --> UC5
A --> UC6
```

## 4. Sequence Diagram: AI Itinerary Generation

```mermaid
sequenceDiagram
    participant User
    participant ReactUI
    participant ExpressAPI
    participant FallbackEngine
    participant GoogleGemini
    
    User->>ReactUI: Enters Trip Details (Goa, 3 Days, Couple)
    ReactUI->>ExpressAPI: POST /api/planner/generate
    ExpressAPI->>ExpressAPI: Check Auth Token (JWT)
    
    ExpressAPI->>GoogleGemini: Sends Prompt via REST
    
    alt API Key Invalid / Rate Limited
        GoogleGemini-->>ExpressAPI: 403 Forbidden / Error
        ExpressAPI->>FallbackEngine: trigger generateFallbackItinerary('Goa')
        FallbackEngine-->>ExpressAPI: Returns structured JSON Mock Data
    else API Key Valid
        GoogleGemini-->>ExpressAPI: Returns Raw Markdown JSON
        ExpressAPI->>ExpressAPI: Parse and clean JSON
    end
    
    ExpressAPI-->>ReactUI: Returns final { itinerary } object
    ReactUI->>User: Renders Timeline UI
```
