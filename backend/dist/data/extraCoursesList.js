"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTRA_COURSE_PREREQUISITES = exports.EXTRA_COURSES = void 0;
exports.EXTRA_COURSES = [
    // =========================================================================
    // 1. COMPUTER SCIENCE & ENGINEERING (CS / Dept ID: 1) - 24 Extra Courses
    // =========================================================================
    // Sem 1
    {
        code: 'CS111',
        name: 'Technical Problem Solving and Algorithmic Thinking',
        department_id: 1,
        credits: 3,
        semester: 1,
        description: 'Decomposition of complex computational problems, pseudo-code construction, flowcharts, and introductory logic puzzles.'
    },
    {
        code: 'CS112',
        name: 'Computer Hardware Architecture & Assembly Lab',
        department_id: 1,
        credits: 3,
        semester: 1,
        description: 'Hands-on motherboard architecture, PCIe buses, CPU socket operations, peripheral interfaces, and bench diagnostics.'
    },
    {
        code: 'CS113',
        name: 'Digital Literacy, Open-Source & Cyber Ethics',
        department_id: 1,
        credits: 2,
        semester: 1,
        description: 'Responsible computing, software licensing (MIT/GPL), intellectual property, digital privacy, and open-source contribution guidelines.'
    },
    // Sem 2
    {
        code: 'CS114',
        name: 'Modern JavaScript and TypeScript Essentials',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'ES6+ asynchronous execution, event loop, Promises, typed interfaces, TypeScript generics, and modern bundlers.'
    },
    {
        code: 'CS115',
        name: 'Linux Shell Scripting & Git Collaboration',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'Advanced Bash scripting, regex processing with sed and awk, Git branching workflows, pull requests, and merge conflict resolution.'
    },
    {
        code: 'CS116',
        name: 'Assembly Language & Low-Level Programming',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'x86-64 assembly instructions, register conventions, stack frame layout, syscall invocation, and C-to-assembly translation.'
    },
    // Sem 3
    {
        code: 'CS211',
        name: 'Principles of Programming Languages & Paradigms',
        department_id: 1,
        credits: 3,
        semester: 3,
        description: 'Comparative study of functional, procedural, and declarative paradigms, type systems, memory safety models, and runtime environments.'
    },
    {
        code: 'CS212',
        name: 'Advanced Data Structures Implementation Lab',
        department_id: 1,
        credits: 2,
        semester: 3,
        description: 'Implementing red-black trees, B-trees, segment trees, disjoint-set forests, and Fibonacci heaps in production languages.'
    },
    {
        code: 'CS213',
        name: 'Systems Programming with Rust',
        department_id: 1,
        credits: 3,
        semester: 3,
        description: 'Ownership, borrowing, lifetimes, fearless concurrency, memory-safe systems programming without garbage collection in Rust.'
    },
    // Sem 4
    {
        code: 'CS214',
        name: 'Database Internals, Query Optimization & Tuning',
        department_id: 1,
        credits: 3,
        semester: 4,
        description: 'B+ tree disk indexing, write-ahead logging (WAL), cost-based query execution planners, explain plans, and index optimization.'
    },
    {
        code: 'CS215',
        name: 'Graph Algorithms and Complex Network Analysis',
        department_id: 1,
        credits: 3,
        semester: 4,
        description: 'Shortest paths, maximum network flow, min-cut, bipartite matching, PageRank algorithm, and social network structure analysis.'
    },
    {
        code: 'CS216',
        name: 'Open Source Software Development & Tooling',
        department_id: 1,
        credits: 3,
        semester: 4,
        description: 'Code review practices, automated linters, semantic versioning, continuous integration, and community package management.'
    },
    // Sem 5
    {
        code: 'CS311',
        name: 'Secure Coding and Web Application Security',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'OWASP Top 10 mitigation, SQL injection, XSS defenses, CSRF tokens, secure session management, and automated SAST/DAST scanning.'
    },
    {
        code: 'CS312',
        name: 'Real-Time Operating Systems (RTOS) Design',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'Hard vs soft real-time constraints, priority inversion, rate monotonic scheduling, FreeRTOS kernel, and task communication.'
    },
    {
        code: 'CS313',
        name: 'Modern Full-Stack Architecture with Next.js',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'Server components, server-side rendering (SSR), incremental static regeneration (ISR), edge API handlers, and Tailwind CSS UI.'
    },
    // Sem 6
    {
        code: 'CS314',
        name: 'Site Reliability Engineering (SRE) & Observability',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'SLOs, SLIs, error budgets, Prometheus metrics collection, Grafana visualization, distributed tracing with OpenTelemetry, and incident response.'
    },
    {
        code: 'CS315',
        name: 'Serverless Cloud Architecture & Event-Driven Systems',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'AWS Lambda, Google Cloud Functions, event triggers, cold start optimization, API gateways, and distributed message queues.'
    },
    {
        code: 'CS316',
        name: 'Enterprise API Management and GraphQL',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'GraphQL schema design, resolvers, Apollo federation, API rate limiting, OAuth2 access delegation, and OpenAPI documentation.'
    },
    // Sem 7
    {
        code: 'CS411',
        name: 'Zero Trust Network Architecture & Identity',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Micro-segmentation, identity-aware proxies, mutual TLS (mTLS), SAML/OIDC authentication federation, and posture assessment.'
    },
    {
        code: 'CS412',
        name: 'Embedded Linux Kernel & Driver Development',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Character device drivers, kernel modules, device trees, GPIO kernel subsystems, and real-time PREEMPT_RT patches.'
    },
    {
        code: 'CS413',
        name: 'Quantum Programming & Circuit Simulation',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Qiskit framework, quantum teleportation simulation, variational quantum eigensolvers (VQE), and noisy intermediate-scale quantum devices.'
    },
    // Sem 8
    {
        code: 'CS414',
        name: 'High-Availability Systems & Chaos Engineering',
        department_id: 1,
        credits: 3,
        semester: 8,
        description: 'Active-active redundancy, geo-replication, split-brain mitigation, Chaos Monkey experiments, and resilient system design.'
    },
    {
        code: 'CS415',
        name: 'AI-Assisted Software Engineering & Code Intelligence',
        department_id: 1,
        credits: 3,
        semester: 8,
        description: 'Neural code generation models, abstract syntax tree (AST) embeddings, automated program synthesis, and AI code review tools.'
    },
    {
        code: 'CS416',
        name: 'Technical Product Management & Startup Incubation',
        department_id: 1,
        credits: 3,
        semester: 8,
        description: 'Product requirements documents (PRD), unit economics, customer discovery interviews, minimum viable product (MVP) design, and pitch decks.'
    },
    // =========================================================================
    // 2. DATA SCIENCE & ARTIFICIAL INTELLIGENCE (DS / Dept ID: 2) - 24 Extra Courses
    // =========================================================================
    // Sem 1
    {
        code: 'DS111',
        name: 'Mathematical Foundations for Data Thinkers',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Vector norms, distance metrics (Euclidean, Cosine, Manhattan), matrix properties, and rate-of-change intuitions for data analytics.'
    },
    {
        code: 'DS112',
        name: 'Data Communication and Visual Storytelling',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Visual cognition, chart selection rules, infographic design, executive presentation techniques, and ethical chart scaling.'
    },
    {
        code: 'DS113',
        name: 'Spreadsheets to SQL: Business Data Analysis',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Transitioning from spreadsheet formulas (VLOOKUP, INDEX/MATCH) to SQL SELECT queries, GROUP BY aggregations, and subqueries.'
    },
    // Sem 2
    {
        code: 'DS114',
        name: 'Statistical Computing with R Programming',
        department_id: 2,
        credits: 3,
        semester: 2,
        description: 'Tidyverse ecosystem, ggplot2 statistical plotting, hypothesis tests in R, tidy data reshaping, and automated R Markdown reports.'
    },
    {
        code: 'DS115',
        name: 'Geospatial Data Science and GIS Mapping',
        department_id: 2,
        credits: 3,
        semester: 2,
        description: 'GeoJSON formats, shapefiles, coordinate reference systems (CRS), spatial joins with GeoPandas, and interactive Folium maps.'
    },
    {
        code: 'DS116',
        name: 'Data Cleansing, Imputation & Quality Engineering',
        department_id: 2,
        credits: 3,
        semester: 2,
        description: 'Detection of data drift, duplicate entity resolution, handling outliers via IQR and z-scores, and rule-based data verification.'
    },
    // Sem 3
    {
        code: 'DS211',
        name: 'Feature Selection and Hyperparameter Tuning',
        department_id: 2,
        credits: 3,
        semester: 3,
        description: 'Recursive feature elimination (RFE), mutual information criteria, Bayesian optimization with Optuna, and cross-validation strategies.'
    },
    {
        code: 'DS212',
        name: 'Applied Machine Learning Laboratory in Python',
        department_id: 2,
        credits: 2,
        semester: 3,
        description: 'Hands-on scikit-learn model pipelines, custom transformers, column transformers, and structured benchmarking on open benchmarks.'
    },
    {
        code: 'DS213',
        name: 'Resampling Methods, Bootstrapping & Monte Carlo',
        department_id: 2,
        credits: 3,
        semester: 3,
        description: 'Non-parametric bootstrap confidence intervals, permutation tests, Monte Carlo integration, and statistical power simulations.'
    },
    // Sem 4
    {
        code: 'DS214',
        name: 'Data Workflow Orchestration with Apache Airflow',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Directed acyclic graphs (DAGs), task dependencies, Celery executors, automated backfilling, and production data pipeline alerts.'
    },
    {
        code: 'DS215',
        name: 'Econometrics and Causal Inference Methods',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Difference-in-differences (DiD), propensity score matching, instrumental variables, regression discontinuity, and causal DAGs.'
    },
    {
        code: 'DS216',
        name: 'Document and Graph Databases for AI Knowledge Stores',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Neo4j Cypher querying, knowledge graph construction, schema-less document indexing in MongoDB, and hybrid querying.'
    },
    // Sem 5
    {
        code: 'DS311',
        name: 'Vector Databases and Dense Semantic Search',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'Approximate nearest neighbor (ANN) search, HNSW indexing, Pinecone, Milvus, ChromaDB, and cosine embedding similarities.'
    },
    {
        code: 'DS312',
        name: 'Deep Learning Engineering with PyTorch',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'Custom nn.Module architectures, custom Dataset/DataLoader pipelines, PyTorch Lightning, multi-GPU DDP training, and mixed precision.'
    },
    {
        code: 'DS313',
        name: 'AI Model Governance, Auditing and Fairness',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'Disparate impact metrics, equalized odds, fairness constraints in optimization, model cards, and AI compliance audit workflows.'
    },
    // Sem 6
    {
        code: 'DS314',
        name: 'Multimodal AI: Vision, Audio & Language Models',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'CLIP cross-modal embeddings, visual question answering (VQA), image captioning, Whisper audio tokenization, and cross-attention.'
    },
    {
        code: 'DS315',
        name: 'Real-Time Streaming Analytics & Feature Stores',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'Feast feature store integration, Apache Kafka stream ingestion, sliding window aggregations, and sub-second online model inference.'
    },
    {
        code: 'DS316',
        name: 'Advanced Ensemble Architectures & Stacking',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'Multi-layer stacking classifiers, blend models, CatBoost categorical handling, LightGBM leaf-wise growth, and tournament ensembles.'
    },
    // Sem 7
    {
        code: 'DS411',
        name: 'Retrieval-Augmented Generation (RAG) Architecture',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Context chunking algorithms, hybrid BM25 + dense search reranking, document parsing, hallucination guardrails, and LangChain agents.'
    },
    {
        code: 'DS412',
        name: 'Synthetic Data Generation and Privacy-Preserving AI',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'CTGAN tabular synthesis, differential privacy guarantees, DP-SGD training, federated learning nodes, and anonymization pipelines.'
    },
    {
        code: 'DS413',
        name: 'AI in Climate, Geospatial & Environmental Modeling',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Satellite imagery segmentation, weather forecasting using graph networks, carbon footprint tracking, and climate data sets.'
    },
    // Sem 8
    {
        code: 'DS414',
        name: 'Generative Media Synthesis & Deepfake Detection',
        department_id: 2,
        credits: 3,
        semester: 8,
        description: 'Diffusion conditioning, latent face swapping, forensic frequency analysis, watermark verification, and synthetic media authentication.'
    },
    {
        code: 'DS415',
        name: 'Autonomous Multi-Agent Systems & Simulation Lab',
        department_id: 2,
        credits: 3,
        semester: 8,
        description: 'CrewAI / AutoGen team coordination, agent reflection loops, tool integration, simulation sandboxes, and autonomous software testers.'
    },
    {
        code: 'DS416',
        name: 'Applied AI Venture Incubation & Case Studies',
        department_id: 2,
        credits: 3,
        semester: 8,
        description: 'Validating real-world AI applications, estimating compute unit costs, assessing model risk, customer onboarding, and venture design.'
    },
    // =========================================================================
    // 3. ELECTRICAL & COMPUTER ENGINEERING (EE / Dept ID: 3) - 24 Extra Courses
    // =========================================================================
    // Sem 1
    {
        code: 'EE111',
        name: 'Engineering Graphics and CAD for Electrical Systems',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'AutoCAD electrical schematic layouts, isometric projections, 3D component modeling, wiring diagrams, and panel drafting.'
    },
    {
        code: 'EE112',
        name: 'Electrical Safety Standards and Wiring Codes',
        department_id: 3,
        credits: 2,
        semester: 1,
        description: 'National Electrical Code (NEC) compliance, earthing/grounding techniques, residual current devices (RCDs), and arc flash safety.'
    },
    {
        code: 'EE113',
        name: 'Introduction to Sensors, Transducers and Actuators',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'Physical operating principles of thermocouples, strain gauges, piezoelectric crystals, optical encoders, and solenoids.'
    },
    // Sem 2
    {
        code: 'EE114',
        name: 'Printed Circuit Board (PCB) Design and Prototyping',
        department_id: 3,
        credits: 3,
        semester: 2,
        description: 'KiCad/Altium schematic capture, multi-layer routing, trace impedance calculation, design for manufacturing (DFM), and surface-mount soldering.'
    },
    {
        code: 'EE115',
        name: 'Semiconductor Fabrication and Cleanroom Processes',
        department_id: 3,
        credits: 3,
        semester: 2,
        description: 'Silicon crystal growth, photolithography, chemical vapor deposition (CVD), ion implantation, etching techniques, and yield metrics.'
    },
    {
        code: 'EE116',
        name: 'Analog Electronic Troubleshooting & Lab Practices',
        department_id: 3,
        credits: 2,
        semester: 2,
        description: 'Oscilloscope probing techniques, signal generator calibration, diagnosing amplifier clipping, parasitic oscillation, and thermal runaway.'
    },
    // Sem 3
    {
        code: 'EE211',
        name: 'Embedded C Programming for Microcontrollers',
        department_id: 3,
        credits: 3,
        semester: 3,
        description: 'Bare-metal embedded C, register-level manipulation, memory-mapped I/O, circular buffers, bitmasking, and hardware watchdog timers.'
    },
    {
        code: 'EE212',
        name: 'Computer-Aided Power Electronic Circuit Simulation',
        department_id: 3,
        credits: 3,
        semester: 3,
        description: 'Simulation of switching converters in MATLAB/Simulink and PLECS, total harmonic distortion (THD), and snubber network design.'
    },
    {
        code: 'EE213',
        name: 'Electromagnetic Compatibility (EMC) & Shielding',
        department_id: 3,
        credits: 3,
        semester: 3,
        description: 'Radiated and conducted emissions, Faraday cages, ground loops, ferrite beads, differential signaling, and FCC/CE compliance testing.'
    },
    // Sem 4
    {
        code: 'EE214',
        name: 'Industrial Motor Drives and Variable Speed Control',
        department_id: 3,
        credits: 3,
        semester: 4,
        description: 'V/f scalar control, field-oriented vector control (FOC), space vector PWM, regenerative braking, and industrial servo drive setups.'
    },
    {
        code: 'EE215',
        name: 'Digital Filter Implementation on DSP Chips',
        department_id: 3,
        credits: 3,
        semester: 4,
        description: 'Fixed-point vs floating-point arithmetic, circular addressing modes, implementing FIR/IIR filters in assembly/C on TI DSP processors.'
    },
    {
        code: 'EE216',
        name: 'High-Frequency RF Circuits and Waveguide Systems',
        department_id: 3,
        credits: 3,
        semester: 4,
        description: 'S-parameters, scattering matrices, microstrip line impedance matching, directional couplers, power dividers, and RF spectrum analysis.'
    },
    // Sem 5
    {
        code: 'EE311',
        name: 'Embedded Linux on ARM Architecture',
        department_id: 3,
        credits: 3,
        semester: 5,
        description: 'Bootloader (U-Boot) configuration, Linux rootfs generation with Buildroot/Yocto, device tree compilation, and user-space I2C/SPI.'
    },
    {
        code: 'EE312',
        name: 'Solar Photovoltaic Power Plant Engineering',
        department_id: 3,
        credits: 3,
        semester: 5,
        description: 'String inverters, central inverters, PV system shading analysis, irradiance modeling, grid feed-in synchronization, and SCADA systems.'
    },
    {
        code: 'EE313',
        name: 'Digital Audio and Speech Signal Processing',
        department_id: 3,
        credits: 3,
        semester: 5,
        description: 'Dynamic range compression, audio equalization filters, psychoacoustic masking, MP3 compression basics, and acoustic echo cancellation.'
    },
    // Sem 6
    {
        code: 'EE314',
        name: 'Battery Management Systems (BMS) Hardware Engineering',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'Lithium-ion cell monitoring ICs, active and passive cell balancing, state-of-charge (SoC) estimation, thermal runaway cutoffs, and CAN bus.'
    },
    {
        code: 'EE315',
        name: 'FPGA Hardware Acceleration for Neural Networks',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'Synthesizing matrix multiplication systolic arrays on Xilinx/Intel FPGAs, high-level synthesis (HLS), and low-latency inference.'
    },
    {
        code: 'EE316',
        name: 'Wireless IoT Protocol Stacks: BLE, Zigbee & LoRa',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'Bluetooth Low Energy GATT profiles, 802.15.4 mesh networking, LoRaWAN chirp spread spectrum, link budgets, and battery life optimization.'
    },
    // Sem 7
    {
        code: 'EE411',
        name: 'Digital Protective Relays and Substation Automation',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'Microprocessor numerical relays, distance protection, differential busbar protection, IEC 61850 protocol, and GOOSE messaging.'
    },
    {
        code: 'EE412',
        name: 'Medical Imaging Instrumentation Electronics',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'High-voltage ultrasound pulse generators, RF receiver coils in MRI, computed tomography x-ray detector electronics, and clinical noise reduction.'
    },
    {
        code: 'EE413',
        name: 'Autonomous Drone Flight Controllers & Avionics',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: '6-DOF IMU sensor calibration, quaternion attitude estimation, brushless ESC telemetry, PID altitude/position stabilization, and failsafe logic.'
    },
    // Sem 8
    {
        code: 'EE414',
        name: 'High-Efficiency Switched-Mode Power Supplies (SMPS)',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Flyback, forward, LLC resonant converters, synchronous rectification, planar magnetics design, and EMI filter suppression.'
    },
    {
        code: 'EE415',
        name: 'Hardware Security Verification and Trust',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Side-channel power analysis attacks (DPA), glitch injection, fault attacks, JTAG lockouts, secure cryptoprocessors, and secure enclaves.'
    },
    {
        code: 'EE416',
        name: 'Electric Grid Dynamics, Stability & Synchrophasors',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Rotor angle stability, voltage collapse phenomena, Phasor Measurement Units (PMU), wide-area damping, and renewable inertia emulation.'
    },
    // =========================================================================
    // 4. DEPARTMENT OF MATHEMATICS (MATH / Dept ID: 4) - 24 Extra Courses
    // =========================================================================
    // Sem 1
    {
        code: 'MATH111',
        name: 'Mathematical Problem Solving and Heuristics',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: 'Polya’s problem-solving strategies, symmetry, extreme principles, parity arguments, mathematical invariants, and Olympiad techniques.'
    },
    {
        code: 'MATH112',
        name: 'History and Philosophy of Mathematical Ideas',
        department_id: 4,
        credits: 2,
        semester: 1,
        description: 'Development of calculus from Archimedes to Newton/Leibniz, non-Euclidean geometry discovery, foundational crises, and modern axiomatic thought.'
    },
    {
        code: 'MATH113',
        name: 'Symbolic Computation and Scientific Programming',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: 'Symbolic algebra with Mathematica and SymPy, high-precision root calculation, symbolic differentiation, series expansions, and 3D visualization.'
    },
    // Sem 2
    {
        code: 'MATH114',
        name: 'Advanced Coordinate Geometry and Conic Sections',
        department_id: 4,
        credits: 3,
        semester: 2,
        description: 'General second-degree Cartesian equations, invariant classification of conics, confocal conics, polar equations of conics, and tangents.'
    },
    {
        code: 'MATH115',
        name: 'Discrete Probability and Combinatorial Games',
        department_id: 4,
        credits: 3,
        semester: 2,
        description: 'Impartial games, Sprague-Grundy theorem, Nim-sums, random walks on lattices, ruin problems, and probabilistic urn models.'
    },
    {
        code: 'MATH116',
        name: 'Mathematical Writing and Scientific LaTeX',
        department_id: 4,
        credits: 2,
        semester: 2,
        description: 'Document typesetting with LaTeX, theorem/proof structuring, TikZ mathematical diagramming, BibTeX bibliography formatting, and peer review standards.'
    },
    // Sem 3
    {
        code: 'MATH211',
        name: 'Mathematical Logic and Formal Axiomatic Systems',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'First-order predicate calculus, soundness and completeness theorems, Zermelo-Fraenkel set theory (ZFC), and Gödel’s Incompleteness theorems.'
    },
    {
        code: 'MATH212',
        name: 'Computational Linear Algebra & Matrix Factorizations',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'QR factorization via Householder reflections, Cholesky decomposition, condition numbers, condition stability, and Krylov subspace solvers.'
    },
    {
        code: 'MATH213',
        name: 'Fourier Series and Boundary Value Problems',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'Orthogonal function expansions, Sturm-Liouville eigenvalue problems, Fourier sine/cosine series, and Dirichlet/Neumann boundary solutions.'
    },
    // Sem 4
    {
        code: 'MATH214',
        name: 'Applied Regression Analysis and GLM Models',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Multiple linear regression, Gauss-Markov theorem, multicollinearity diagnostics (VIF), generalized linear models (logistic, Poisson), and residual analysis.'
    },
    {
        code: 'MATH215',
        name: 'Combinatorial Optimization and Matroid Theory',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Greedy algorithms on matroids, matroid intersection theorem, branch-and-bound integer programming, cutting plane methods, and TSP heuristics.'
    },
    {
        code: 'MATH216',
        name: 'Special Functions of Mathematical Physics',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Gamma and Beta functions, Bessel differential equations, Legendre polynomials, Hermite polynomials, and hypergeometric series solutions.'
    },
    // Sem 5
    {
        code: 'MATH311',
        name: 'Numerical Solutions of Differential Equations',
        department_id: 4,
        credits: 3,
        semester: 5,
        description: 'Adaptive Runge-Kutta-Fehlberg methods, multistep Adams-Bashforth techniques, boundary value shooting methods, and stiff ODE stability regions.'
    },
    {
        code: 'MATH312',
        name: 'Matrix Analysis and Perturbation Theory',
        department_id: 4,
        credits: 3,
        semester: 5,
        description: 'Perron-Frobenius theorem for non-negative matrices, Jordan canonical form, Gerschgorin disc theorem, and eigenvalue perturbation bounds.'
    },
    {
        code: 'MATH313',
        name: 'Mathematical Optimization Lab with Python & Julia',
        department_id: 4,
        credits: 2,
        semester: 5,
        description: 'Modeling linear and quadratic programs in Julia JuMP and SciPy optimize, interior point solvers, and duality gap analysis.'
    },
    // Sem 6
    {
        code: 'MATH314',
        name: 'Convex Analysis and Variational Inequalities',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Convex sets, supporting hyperplanes, subgradients, Fenchel-Legendre conjugates, proximal operators, and ADMM algorithm.'
    },
    {
        code: 'MATH315',
        name: 'Measure Theory and Lebesgue Integration',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Sigma-algebras, outer measure, Lebesgue measurable sets, Monotone Convergence Theorem, Dominated Convergence Theorem, and Fatou’s lemma.'
    },
    {
        code: 'MATH316',
        name: 'Mathematical Cryptanalysis and Prime Field Arithmetic',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Quadratic sieve integer factorization, Pollard’s rho algorithm, baby-step giant-step discrete log, and elliptic curve point counting (Schoof).'
    },
    // Sem 7
    {
        code: 'MATH411',
        name: 'Advanced Spectral Theory in Banach Spaces',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Resolvent sets, spectrum of bounded linear operators, compact self-adjoint operators, spectral decomposition theorem, and Fredholm theory.'
    },
    {
        code: 'MATH412',
        name: 'Quantitative Risk Analysis and Actuarial Models',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Extreme value theory (EVT), copulas for joint tail dependencies, Conditional Value at Risk (CVaR), and ruin probability in risk models.'
    },
    {
        code: 'MATH413',
        name: 'Ergodic Theory and Measure-Preserving Dynamical Systems',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Measure-preserving transformations, Poincaré recurrence theorem, Birkhoff Ergodic Theorem, mixing properties, and entropy of maps.'
    },
    // Sem 8
    {
        code: 'MATH414',
        name: 'Computational Algebraic Geometry & Gröbner Bases',
        department_id: 4,
        credits: 3,
        semester: 8,
        description: 'Affine varieties, polynomial ideals, Hilbert’s Basis Theorem, Buchberger’s algorithm for Gröbner bases, and automated elimination theory.'
    },
    {
        code: 'MATH415',
        name: 'Mathematical Foundations of Quantum Information',
        department_id: 4,
        credits: 3,
        semester: 8,
        description: 'Density operators, trace distance and fidelity, von Neumann entropy, completely positive trace-preserving (CPTP) maps, and quantum channels.'
    },
    {
        code: 'MATH416',
        name: 'Mathematics of Deep Learning Architectures',
        department_id: 4,
        credits: 3,
        semester: 8,
        description: 'Universal approximation theorems, neural tangent kernel (NTK), generalization bounds via Rademacher complexity, and loss landscape geometry.'
    }
];
exports.EXTRA_COURSE_PREREQUISITES = {
    // CS
    CS114: ['CS104'],
    CS115: ['CS109'],
    CS116: ['CS107'],
    CS211: ['CS106'],
    CS212: ['CS201'],
    CS213: ['CS106'],
    CS214: ['CS204'],
    CS215: ['CS201'],
    CS216: ['CS208'],
    CS311: ['CS208', 'CS303'],
    CS312: ['CS207'],
    CS313: ['CS210'],
    CS314: ['CS307'],
    CS315: ['CS306'],
    CS316: ['CS310'],
    CS411: ['CS402'],
    CS412: ['CS207', 'CS205'],
    CS413: ['CS404'],
    CS414: ['CS406'],
    CS415: ['CS408'],
    CS416: ['CS409'],
    // DS
    DS114: ['DS101'],
    DS115: ['DS107'],
    DS116: ['DS106'],
    DS211: ['DS201'],
    DS212: ['DS201'],
    DS213: ['DS204'],
    DS214: ['DS208'],
    DS215: ['DS207'],
    DS216: ['DS108'],
    DS311: ['DS302'],
    DS312: ['DS301'],
    DS313: ['DS303'],
    DS314: ['DS306', 'DS307'],
    DS315: ['DS303'],
    DS316: ['DS206'],
    DS411: ['DS307'],
    DS412: ['DS401'],
    DS413: ['DS207'],
    DS414: ['DS401'],
    DS415: ['DS407'],
    DS416: ['DS408'],
    // EE
    EE114: ['EE108'],
    EE115: ['EE107'],
    EE116: ['EE108'],
    EE211: ['EE201'],
    EE212: ['EE106'],
    EE213: ['EE102'],
    EE214: ['EE206', 'EE210'],
    EE215: ['EE202'],
    EE216: ['EE209'],
    EE311: ['EE301'],
    EE312: ['EE305'],
    EE313: ['EE302'],
    EE314: ['EE308'],
    EE315: ['EE306'],
    EE316: ['EE307'],
    EE411: ['EE401'],
    EE412: ['EE405'],
    EE413: ['EE402'],
    EE414: ['EE406'],
    EE415: ['EE408'],
    EE416: ['EE410'],
    // MATH
    MATH114: ['MATH103'],
    MATH115: ['MATH105'],
    MATH116: ['MATH110'],
    MATH211: ['MATH110'],
    MATH212: ['MATH204'],
    MATH213: ['MATH201'],
    MATH214: ['MATH208'],
    MATH215: ['MATH209'],
    MATH216: ['MATH210'],
    MATH311: ['MATH301'],
    MATH312: ['MATH204'],
    MATH313: ['MATH305'],
    MATH314: ['MATH306'],
    MATH315: ['MATH303'],
    MATH316: ['MATH309'],
    MATH411: ['MATH401'],
    MATH412: ['MATH403'],
    MATH413: ['MATH404'],
    MATH414: ['MATH302'],
    MATH415: ['MATH408'],
    MATH416: ['MATH306', 'MATH401']
};
