# 3D Printer Fleet Management Architecture

## Overview
This document outlines the architecture for managing thousands of distributed 3D printers using Zrok as the proxy solution for Moonraker API access. The design focuses on scalability, reliability, and simplicity of implementation.

## System Components

### 1. Local Environment (Printer Side)
- 3D Printer running Klipper
- Moonraker API (port 7125)
- Zrok Agent for secure tunneling

### 2. Control Layer
- Central Control Server
- Connection Registry Database
- Load Manager
- Metrics Tracker

### 3. Infrastructure
- Multiple standalone Zrok Frontends
- Geographic distribution for better latency
- Independent operation for fault isolation

## Printer communication Diagram

```mermaid
flowchart TB
    subgraph "Control Layer"
        CS[Control Server] --> |Manages| DB[(Connection Registry)]
        CS --> |Routes| LM[Load Manager]
        LM --> |Monitors| MT[Metrics Tracker]
    end

    subgraph "Zrok Frontends"
        Z1[Zrok Frontend 1\nRegion A]
        Z2[Zrok Frontend 2\nRegion B]
        Z3[Zrok Frontend N\nRegion X]
    end

    subgraph "Printer Agents"
        P1[Printer 1] --> |Get Frontend URL| CS
        P2[Printer 2] --> |Get Frontend URL| CS
        P3[Printer N] --> |Get Frontend URL| CS
        
        P1 -.-> |Connect to assigned| Z1
        P2 -.-> |Connect to assigned| Z2
        P3 -.-> |Connect to assigned| Z3
    end
```

## System communication Diagram

```mermaid
flowchart TB
    subgraph "Content Platform"
        WEB[Web Frontend] --> |API| AS[Application Server]
        AS --> |Manages| SDB[(STL Database)]
        AS --> |Auth| UDB[(User DB)]        
    end

    AS
    CS

    subgraph "Control Layer"        
        
        CS --> |Manages| DB[(Connection Registry)]
        CS --> |Routes| LM[Load Manager]
        
        %% Print Job Flow
        CS[Control Server] 
        PQ[Print Queue Manager]
        CS -->|"5-Send to Queue"| PQ
    end

    subgraph "Zrok Frontends"
        Z1[Zrok Frontend 1\nRegion A]
        Z2[Zrok Frontend 2\nRegion B]
    end

    subgraph "Printer Side"
        P1[Printer 1] --> |Get Frontend URL| CS
        P1
        Z1
        
        M1[Zrok Agent] <--> A1        
        A1[Moonraker API] --> P1        
        Z1 <-.-> |Forward API Calls| M1
    end

    %% Print Flow
    WEB --> |1-Select STL| USER((User))
    USER -->|2-Choose Printer| WEB
    WEB --> |3-Submit Job| AS
    AS -->|"4-Print Jobs"| CS
    PQ -->|"6-Forward to Printer"| Z1

    style WEB fill:#98FB98
    style AS fill:#FFB6C1
    style CS fill:#DDA0DD
    style Z1 fill:#F0E68C
    style Z2 fill:#F0E68C
    style PQ fill:#ff9999

    %% Add notes
    note1[Content website never\nconnects directly\nto printers]
    note2[Control server manages\nall printer communication]
    note3[Print jobs queued\nand monitored]
    
    note1 -.-> AS
    note2 -.-> CS
    note3 -.-> PQ
	subGraph3
	
	subGraph3
	
	note3
	
	subGraph0 --- n4
	
```

## Clarified Print Job Flow

```mermaid
flowchart TB
    subgraph "Content Platform"
        WEB[Web Frontend] --> |API| AS[Application Server]
        AS --> |Manages| SDB[(STL Database)]
        AS --> |Auth| UDB[(User DB)]
        AS --> |1. Job Commands| CS[Control Server]
    end

    subgraph "Control Layer"
        CS --> |Manages| DB[(Connection Registry)]
        CS --> |Routes| LM[Load Manager]
        
        %% Print Queue Management
        PQ[Print Queue Manager]
        CS --> |2. Schedule Job| PQ
        PQ --> |3. Status Updates| CS
    end

    subgraph "Zrok Frontends"
        Z1[Zrok Frontend 1\nRegion A]
        Z2[Zrok Frontend 2\nRegion B]
    end

    subgraph "Printer Side"
        P1[Printer 1] 
        M1[Moonraker API] --> P1
        Z1 -.-> |4. Execute Job| M1
    end

    style WEB fill:#98FB98
    style AS fill:#FFB6C1
    style CS fill:#DDA0DD
    style PQ fill:#F0E68C

    %% Add notes
    note1[Job Commands:\n- Start Print\n- Cancel Print\n- Get Status]
    note2[Queue Operations:\n- Schedule Jobs\n- Manage Priority\n- Handle Retries]
    
    note1 -.-> AS
    note2 -.-> PQ
```

## Key Design Decisions

### 1. Use of Zrok
- Chosen for its lightweight and reliable tunneling capabilities
- Simple deployment and maintenance
- No modifications needed to Moonraker API
- Secure by default with TLS

### 2. Distributed Frontend Approach
- Multiple standalone Zrok instances instead of clustering
- Each frontend operates independently
- Simpler than implementing load balancing at Zrok level
- Better fault isolation

### 3. Smart Routing via Control Server
- Central control server manages printer-to-frontend assignments
- Assignments based on:
  - Geographic proximity
  - Current frontend load
  - System health metrics
  - Network conditions

## Implementation Requirements

### 1. Control Server
- RESTful API for printer registration
- Frontend health monitoring
- Connection tracking
- Load balancing algorithm
- Metrics collection and analysis

### 2. Zrok Frontend
- Minimum Requirements per Instance:
  - 1-2 CPU cores
  - 1-2 GB RAM
  - 10GB storage
  - Standard network connection
- Scales to approximately 100-200 printers per instance

### 3. Printer Agent
- Zrok agent installation
- Initial registration with control server
- Automatic reconnection logic
- Health reporting

## Security Considerations

1. All connections secured via TLS
2. Token-based authentication
3. Isolated printer connections
4. Access control at control server level

## Scaling Strategy

1. Start with minimal deployment:
   - Single frontend
   - Basic control server
   - Monitor resource usage

2. Scale horizontally by:
   - Adding Zrok frontends in new regions
   - Enhancing control server logic
   - Implementing more sophisticated routing

3. Monitor and optimize:
   - Track connection metrics
   - Analyze geographic distribution
   - Adjust routing algorithms

## Next Steps

1. Implementation Priority:
   - Set up control server infrastructure
   - Deploy first Zrok frontend
   - Develop printer registration process
   - Implement basic routing logic

2. Testing:
   - Connection reliability
   - Failover scenarios
   - Load testing
   - Geographic distribution effectiveness