```mermaid

flowchart TD
    %% Inputs
    A[Promethean Inputs] -->|Excel Workbook| B[Standard Architecture Review]
    A -->|JSON Input| C[Enterprise Architecture Review: MAF Orchestrator]

    %% Standard Review Branch
    B --> D[Convert Excel to JSON]
    D --> E[Call LLM for Review]
    E --> F[Store Logs: Response, Token Usage, Time Taken]
    F --> G[Frontend: Executive Summary, Recommendations, Best Practices]
    
    %% Enterprise Review Branch
    C --> H[Input Validation]
    C --> I[Parallel Processing: Image Preprocessing & Demographics]
    
    %% Image Preprocessing triggers Image Processing
    I --> J[Image Processing Agent]
    
    %% Agents
    I --> K[Demographics Agent]
    J --> L[Triage Agent]
    L --> M[Remediation Agent]
    M --> N[Formatting Agent]
    
    %% LLM calls
    J -->|LLM Call| J1[LLM Response]
    K -->|LLM Call| K1[LLM Response]
    M -->|LLM Call| M1[LLM Response]
    N -->|LLM Call| N1[LLM Response]

    %% Scoring Agents after each
    J1 --> J2[Scoring Agent: Image Processing]
    K1 --> K2[Scoring Agent: Demographics]
    M1 --> M2[Scoring Agent: Remediation]
    N1 --> N2[Scoring Agent: Formatting]

    %% Logging
    J2 --> O[Store Logs: Response, Token Usage, Time Taken]
    K2 --> O
    M2 --> O
    N2 --> O

    %% Frontend output
    O --> P[Frontend: Executive Summary, Recommendations, Best Practices]

    %% Azure infrastructure
    subgraph Azure
        Q[Azure Blob Storage: Policies, Docs]
        R[Frontend & Backend Apps: Secured in VNet, App Services]
    end
    B --> Q
    C --> Q
    P --> R
