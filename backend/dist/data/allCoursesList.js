"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COURSE_PREREQUISITES = exports.ALL_COURSES = void 0;
exports.ALL_COURSES = [
    // ==========================================
    // DEPARTMENT 1: COMPUTER SCIENCE & ENGINEERING (CS)
    // ==========================================
    // Sem 1
    {
        code: 'CS101',
        name: 'Introduction to Problem Solving and C Programming',
        department_id: 1,
        credits: 4,
        semester: 1,
        description: 'Basic procedural programming in C covering data types, flow control, arrays, pointers, functions, and structured memory management.'
    },
    {
        code: 'CS102',
        name: 'Fundamentals of Computing and Information Systems',
        department_id: 1,
        credits: 3,
        semester: 1,
        description: 'Historical evolution of computer architecture, binary logic, peripheral devices, OS basics, and foundational network concepts.'
    },
    {
        code: 'CS103',
        name: 'Digital Logic Design and Binary Arithmetic',
        department_id: 1,
        credits: 4,
        semester: 1,
        description: 'Boolean algebra, logic gate design, Karnaugh maps, combinational circuits (adders, multiplexers), and sequential flip-flops.'
    },
    {
        code: 'CS104',
        name: 'Web Technology Basics (HTML/CSS/JS)',
        department_id: 1,
        credits: 3,
        semester: 1,
        description: 'Semantic HTML5 structure, modern CSS3 responsive layouts (Flexbox/Grid), and client-side JavaScript DOM manipulation.'
    },
    {
        code: 'CS105',
        name: 'Principles of Software and Hardware Systems',
        department_id: 1,
        credits: 3,
        semester: 1,
        description: 'Introduction to system hardware abstractions, instruction execution cycles, system buses, memory hierarchies, and device drivers.'
    },
    // Sem 2
    {
        code: 'CS106',
        name: 'Object-Oriented Programming with C++',
        department_id: 1,
        credits: 4,
        semester: 2,
        description: 'Classes, objects, data encapsulation, inheritance, polymorphism, virtual functions, templates, and the Standard Template Library (STL).'
    },
    {
        code: 'CS107',
        name: 'Computer Architecture and Digital Organization',
        department_id: 1,
        credits: 4,
        semester: 2,
        description: 'Instruction set architectures (ISA), RISC vs CISC, CPU pipelining, cache memory organizations, and hardware interrupt handling.'
    },
    {
        code: 'CS108',
        name: 'Python Programming for Engineers',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'Python syntax, data structures, modular programming, exception handling, file I/O, and introductory data analysis packages.'
    },
    {
        code: 'CS109',
        name: 'Foundations of System Administration and Linux',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'Linux shell scripting (Bash), file system permissions, user management, process monitoring, cron scheduling, and network configurations.'
    },
    {
        code: 'CS110',
        name: 'Mathematical Foundations of Computer Science',
        department_id: 1,
        credits: 3,
        semester: 2,
        description: 'Propositional logic, set theory, relations, functions, recurrence relations, and combinatorial counting principles for computing.'
    },
    // Sem 3
    {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        department_id: 1,
        credits: 4,
        semester: 3,
        description: 'Stacks, queues, linked lists, binary search trees, AVL trees, heaps, graph traversals (BFS/DFS), and asymptotic Big-O runtime analysis.'
    },
    {
        code: 'CS202',
        name: 'Advanced Java Enterprise Programming',
        department_id: 1,
        credits: 4,
        semester: 3,
        description: 'JVM architecture, multi-threading, concurrency, generics, Java Collections Framework, JDBC database connectivity, and stream APIs.'
    },
    {
        code: 'CS203',
        name: 'Discrete Structures and Automata Theory',
        department_id: 1,
        credits: 3,
        semester: 3,
        description: 'Deterministic and non-deterministic finite automata (DFA/NFA), regular expressions, context-free grammars, pushdown automata, and Turing machines.'
    },
    {
        code: 'CS204',
        name: 'Database Management Systems (DBMS)',
        department_id: 1,
        credits: 4,
        semester: 3,
        description: 'Relational model, ER modeling, SQL querying, relational algebra, schema normalization (1NF–BCNF), indexing, and ACID transaction guarantees.'
    },
    {
        code: 'CS205',
        name: 'Microprocessors and Interfacing Techniques',
        department_id: 1,
        credits: 3,
        semester: 3,
        description: 'Internal architecture of x86/ARM microprocessors, pin configurations, bus timing, memory interfacing, and I/O interrupt controllers.'
    },
    // Sem 4
    {
        code: 'CS206',
        name: 'Design and Analysis of Algorithms',
        department_id: 1,
        credits: 4,
        semester: 4,
        description: 'Divide-and-conquer, greedy techniques, dynamic programming, network flow, NP-completeness, and approximation algorithms.'
    },
    {
        code: 'CS207',
        name: 'Operating Systems Principles',
        department_id: 1,
        credits: 4,
        semester: 4,
        description: 'Process management, CPU scheduling, thread synchronization, deadlocks, virtual memory paging, segmentation, and file system architectures.'
    },
    {
        code: 'CS208',
        name: 'Software Engineering and Object-Oriented Modeling',
        department_id: 1,
        credits: 3,
        semester: 4,
        description: 'SDLC lifecycles, Agile and Scrum workflows, UML diagrams, architectural patterns, requirements specification, and design patterns.'
    },
    {
        code: 'CS209',
        name: 'Computer Communications and Networking',
        department_id: 1,
        credits: 4,
        semester: 4,
        description: 'OSI and TCP/IP stack models, IPv4/IPv6 routing, TCP congestion control, UDP, DNS, HTTP/HTTPS, and physical link layer protocols.'
    },
    {
        code: 'CS210',
        name: 'Full-Stack Web Development Frameworks',
        department_id: 1,
        credits: 3,
        semester: 4,
        description: 'Modern full-stack development covering React, Node.js/Express, state management, RESTful API design, and token authentication.'
    },
    // Sem 5
    {
        code: 'CS301',
        name: 'Formal Languages and Compiler Design',
        department_id: 1,
        credits: 4,
        semester: 5,
        description: 'Lexical analysis, context-free parsing (LL/LR), syntax-directed translation, intermediate code generation, and optimization techniques.'
    },
    {
        code: 'CS302',
        name: 'Distributed Systems and Parallel Computing',
        department_id: 1,
        credits: 4,
        semester: 5,
        description: 'RPC/gRPC communication, logical clocks, distributed consensus (Raft/Paxos), fault tolerance, MapReduce, and multi-threaded parallel programming.'
    },
    {
        code: 'CS303',
        name: 'Network Security and Cryptography',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'Symmetric/asymmetric ciphers (AES, RSA), hashing algorithms (SHA), digital signatures, public key infrastructure (PKI), and firewalls.'
    },
    {
        code: 'CS304',
        name: 'Mobile Application Development (Android/iOS)',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'Cross-platform mobile development, UI components, background services, lifecycle management, local SQLite storage, and mobile REST APIs.'
    },
    {
        code: 'CS305',
        name: 'Human-Computer Interaction and UI/UX Design',
        department_id: 1,
        credits: 3,
        semester: 5,
        description: 'User research, wireframing, prototyping, usability testing, cognitive accessibility, design thinking, and modern Figma UI workflows.'
    },
    // Sem 6
    {
        code: 'CS306',
        name: 'Cloud Computing Infrastructure and Virtualization',
        department_id: 1,
        credits: 4,
        semester: 6,
        description: 'Hypervisors, IaaS/PaaS/SaaS models, AWS/GCP cloud services, virtual private clouds (VPCs), object storage, and serverless architectures.'
    },
    {
        code: 'CS307',
        name: 'Modern DevOps Engineering and CI/CD Pipelines',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'Docker containerization, Kubernetes orchestration, Git workflows, automated testing pipelines, and infrastructure-as-code (Terraform).'
    },
    {
        code: 'CS308',
        name: 'Information Storage Management and Big Data',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'SAN/NAS storage arrays, RAID configurations, distributed file storage (HDFS), deduplication, and enterprise backup/disaster recovery.'
    },
    {
        code: 'CS309',
        name: 'Software Testing and Quality Assurance',
        department_id: 1,
        credits: 3,
        semester: 6,
        description: 'Unit testing, integration testing, test-driven development (TDD), automated UI testing, code coverage metrics, and continuous quality auditing.'
    },
    {
        code: 'CS310',
        name: 'Microservices Architecture and REST APIs',
        department_id: 1,
        credits: 4,
        semester: 6,
        description: 'Decomposition of monolithic architectures, API gateways, service discovery, event-driven messaging (Kafka/RabbitMQ), and distributed tracing.'
    },
    // Sem 7
    {
        code: 'CS401',
        name: 'High Performance Computing (HPC)',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Multi-core processing, OpenMP shared-memory programming, MPI message-passing architectures, and GPU computing using CUDA.'
    },
    {
        code: 'CS402',
        name: 'Enterprise Cyber Security and Forensics',
        department_id: 1,
        credits: 4,
        semester: 7,
        description: 'Penetration testing, vulnerability scanning, threat intelligence, security operations centers (SOC), and digital memory forensics.'
    },
    {
        code: 'CS403',
        name: 'Blockchain Engineering and Smart Contracts',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Cryptographic hashes, consensus mechanisms (PoW/PoS), Ethereum smart contract development using Solidity, and decentralized apps (dApps).'
    },
    {
        code: 'CS404',
        name: 'Quantum Computing Algorithms',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Qubits, quantum superposition, entanglement, quantum logic gates, Deutsch-Jozsa algorithm, Grover\'s search, and Shor\'s factorization.'
    },
    {
        code: 'CS405',
        name: 'Augmented and Virtual Reality Development',
        department_id: 1,
        credits: 3,
        semester: 7,
        description: 'Spatial computing, 3D graphics rendering pipelines, Unity/Unreal VR headsets integration, motion tracking, and immersive UX interactions.'
    },
    // Sem 8
    {
        code: 'CS406',
        name: 'Scalable Web Systems and Distributed Caching',
        department_id: 1,
        credits: 3,
        semester: 8,
        description: 'High-concurrency system design, Redis/Memcached distributed caching, database sharding, load balancing, and rate limiting strategies.'
    },
    {
        code: 'CS407',
        name: 'Autonomous Robotics Software Architecture',
        department_id: 1,
        credits: 4,
        semester: 8,
        description: 'Robot Operating System (ROS2), kinematics, path planning algorithms (A*, Dijkstra), sensor fusion (LiDAR/Camera), and SLAM mapping.'
    },
    {
        code: 'CS408',
        name: 'Software Architecture and Design Patterns',
        department_id: 1,
        credits: 3,
        semester: 8,
        description: 'Creational, structural, and behavioral design patterns, domain-driven design (DDD), enterprise architectural styles, and code refactoring.'
    },
    {
        code: 'CS409',
        name: 'Capstone Software Engineering Project',
        department_id: 1,
        credits: 6,
        semester: 8,
        description: 'End-to-end industrial software engineering project spanning requirements, architecture, full-stack implementation, deployment, and testing.'
    },
    {
        code: 'CS410',
        name: 'Industry Seminar and Research Internship',
        department_id: 1,
        credits: 4,
        semester: 8,
        description: 'Investigation of cutting-edge research literature, technical whitepapers, prototype demonstrations, and professional peer reviews.'
    },
    // ==========================================
    // DEPARTMENT 2: DATA SCIENCE & ARTIFICIAL INTELLIGENCE (DS)
    // ==========================================
    // Sem 1
    {
        code: 'DS101',
        name: 'Principles of Data Science and Analytics',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Overview of data lifecycle, data types, hypothesis generation, problem formulation, and data-driven decision frameworks.'
    },
    {
        code: 'DS102',
        name: 'Computational Thinking with Python',
        department_id: 2,
        credits: 4,
        semester: 1,
        description: 'Algorithmic logic, Python syntax, lists, dictionaries, comprehension syntax, recursion, file operations, and code debugging.'
    },
    {
        code: 'DS103',
        name: 'Data Scraping and Information Retrieval',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Web scraping with BeautifulSoup and Selenium, REST API consumption, JSON/XML parsing, and web crawler design.'
    },
    {
        code: 'DS104',
        name: 'Foundations of Scientific Computing',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Numerical array operations, linear algebra primitives, random number generation, and vectorized computations using NumPy.'
    },
    {
        code: 'DS105',
        name: 'Exploratory Data Analysis & Spreadsheet Modeling',
        department_id: 2,
        credits: 3,
        semester: 1,
        description: 'Summary statistics, pivot tables, identifying outliers, cleaning missing values, and exploratory charting techniques.'
    },
    // Sem 2
    {
        code: 'DS106',
        name: 'Advanced Data Manipulation with Pandas & NumPy',
        department_id: 2,
        credits: 4,
        semester: 2,
        description: 'DataFrames, multi-indexing, aggregation, grouping, merging, reshaping, and time-series date parsing with Python Pandas.'
    },
    {
        code: 'DS107',
        name: 'Interactive Data Storytelling and Visualization',
        department_id: 2,
        credits: 3,
        semester: 2,
        description: 'Visual perception theory, plotting with Matplotlib, Seaborn, and interactive web charts using Plotly and Tableau.'
    },
    {
        code: 'DS108',
        name: 'Relational and NoSQL Databases for Data Science',
        department_id: 2,
        credits: 4,
        semester: 2,
        description: 'Advanced SQL aggregations, window functions, indexing, document databases (MongoDB), and key-value datastores.'
    },
    {
        code: 'DS109',
        name: 'Applied Linear Algebra for Machine Learning',
        department_id: 2,
        credits: 4,
        semester: 2,
        description: 'Vector spaces, matrices, projections, eigenvalues, eigenvectors, and singular value decomposition (SVD) for dimensionality reduction.'
    },
    {
        code: 'DS110',
        name: 'Statistical Inference and Modeling',
        department_id: 2,
        credits: 3,
        semester: 2,
        description: 'Confidence intervals, hypothesis testing (t-tests, ANOVA, Chi-Square), p-values, power analysis, and parametric modeling.'
    },
    // Sem 3
    {
        code: 'DS201',
        name: 'Machine Learning: Supervised Methods',
        department_id: 2,
        credits: 4,
        semester: 3,
        description: 'Linear regression, regularizations (Lasso/Ridge), logistic regression, support vector machines (SVM), and k-nearest neighbors (KNN).'
    },
    {
        code: 'DS202',
        name: 'Optimization Methods for Data Analytics',
        department_id: 2,
        credits: 3,
        semester: 3,
        description: 'Convex optimization, gradient descent variants (SGD, Adam), Lagrange multipliers, and cost function loss surfaces.'
    },
    {
        code: 'DS203',
        name: 'Data Warehousing, Mining, and ETL Architectures',
        department_id: 2,
        credits: 4,
        semester: 3,
        description: 'Star/snowflake schemas, dimensional modeling, automated ETL workflows, association rule mining, and data lakes.'
    },
    {
        code: 'DS204',
        name: 'Probability Theory and Random Processes',
        department_id: 2,
        credits: 3,
        semester: 3,
        description: 'Joint and marginal probabilities, Bayes\' theorem, discrete and continuous random variables, and central limit theorem.'
    },
    {
        code: 'DS205',
        name: 'Feature Engineering and Dimensionality Reduction',
        department_id: 2,
        credits: 3,
        semester: 3,
        description: 'Missing value imputation, one-hot encoding, feature scaling, PCA, t-SNE, UMAP, and feature selection strategies.'
    },
    // Sem 4
    {
        code: 'DS206',
        name: 'Machine Learning: Unsupervised & Ensemble Methods',
        department_id: 2,
        credits: 4,
        semester: 4,
        description: 'K-Means, hierarchical clustering, DBSCAN, decision trees, random forests, AdaBoost, XGBoost, and LightGBM.'
    },
    {
        code: 'DS207',
        name: 'Time Series Analysis and Forecasting',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Trend and seasonality decomposition, stationary tests, ARIMA, SARIMA, exponential smoothing, and Prophet forecasting models.'
    },
    {
        code: 'DS208',
        name: 'Big Data Technologies with Hadoop and Spark',
        department_id: 2,
        credits: 4,
        semester: 4,
        description: 'Hadoop ecosystem, Spark RDDs and DataFrames, distributed memory computing, Spark SQL, and parallel data transforms.'
    },
    {
        code: 'DS209',
        name: 'Data Ethics, Privacy, and Governance',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Algorithmic fairness, bias mitigation, differential privacy, GDPR/data regulation compliance, and ethical AI stewardship.'
    },
    {
        code: 'DS210',
        name: 'Bayesian Data Analysis and Monte Carlo Methods',
        department_id: 2,
        credits: 3,
        semester: 4,
        description: 'Prior and posterior distributions, conjugate priors, Markov Chain Monte Carlo (MCMC), and probabilistic programming with PyMC.'
    },
    // Sem 5
    {
        code: 'DS301',
        name: 'Deep Learning and Neural Network Architectures',
        department_id: 2,
        credits: 4,
        semester: 5,
        description: 'Multi-layer perceptrons, activation functions, backpropagation calculus, regularization (Dropout), PyTorch, and TensorFlow.'
    },
    {
        code: 'DS302',
        name: 'Natural Language Processing (NLP) Fundamentals',
        department_id: 2,
        credits: 4,
        semester: 5,
        description: 'Tokenization, lemmatization, TF-IDF, N-grams, Word2Vec, GloVe embeddings, sentiment analysis, and named entity recognition.'
    },
    {
        code: 'DS303',
        name: 'Machine Learning Operations (MLOps) & Deployment',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'MLflow experiment tracking, model registry, containerized model serving with FastAPI/Docker, and monitoring model drift.'
    },
    {
        code: 'DS304',
        name: 'Cloud-Based Machine Learning Platforms',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'Training and deploying ML models on AWS SageMaker and Google Cloud Vertex AI, managed pipelines, and automated hyperparameters.'
    },
    {
        code: 'DS305',
        name: 'Recommender Systems and Collaborative Filtering',
        department_id: 2,
        credits: 3,
        semester: 5,
        description: 'User-based and item-based collaborative filtering, matrix factorization (SVD++), content-based recommendations, and neural rankers.'
    },
    // Sem 6
    {
        code: 'DS306',
        name: 'Computer Vision and Pattern Recognition',
        department_id: 2,
        credits: 4,
        semester: 6,
        description: 'Convolutional Neural Networks (CNNs), ResNet, image classification, object detection (YOLO), and semantic image segmentation.'
    },
    {
        code: 'DS307',
        name: 'Large Language Models (LLMs) and Prompt Engineering',
        department_id: 2,
        credits: 4,
        semester: 6,
        description: 'Transformer architectures, self-attention mechanisms, BERT, GPT, fine-tuning (LoRA), prompt engineering, and RAG architectures.'
    },
    {
        code: 'DS308',
        name: 'Reinforcement Learning and Decision Intelligence',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'Markov Decision Processes (MDP), Q-Learning, Deep Q-Networks (DQN), policy gradients, Actor-Critic, and reward engineering.'
    },
    {
        code: 'DS309',
        name: 'Graph Neural Networks and Network Analysis',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'Graph representations, centrality metrics, community detection, Node2Vec, Graph Convolutional Networks (GCN), and GraphSAGE.'
    },
    {
        code: 'DS310',
        name: 'Business Intelligence, Dashboards, and Power BI',
        department_id: 2,
        credits: 3,
        semester: 6,
        description: 'Enterprise reporting, DAX expressions, KPI modeling, real-time analytics streaming, and executive dashboard design.'
    },
    // Sem 7
    {
        code: 'DS401',
        name: 'Generative AI and Diffusion Models',
        department_id: 2,
        credits: 4,
        semester: 7,
        description: 'Variational Autoencoders (VAEs), Generative Adversarial Networks (GANs), Denoising Diffusion Probabilistic Models (DDPM), and latent spaces.'
    },
    {
        code: 'DS402',
        name: 'Speech Recognition and Audio Signal Processing',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Acoustic feature extraction (MFCCs), spectrograms, automated speech recognition (ASR), CTC loss, and Whisper speech models.'
    },
    {
        code: 'DS403',
        name: 'Edge AI and Embedded Intelligence',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Model quantization (INT8), pruning, knowledge distillation, TensorFlow Lite, and ONNX deployment on Raspberry Pi and Jetson Nano.'
    },
    {
        code: 'DS404',
        name: 'Healthcare Analytics and Bioinformatics Data',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Electronic health records analysis, genomic sequencing data parsing, survival analysis, and medical image diagnostics.'
    },
    {
        code: 'DS405',
        name: 'Financial Risk Modeling and Algorithmic Trading',
        department_id: 2,
        credits: 3,
        semester: 7,
        description: 'Quantitative portfolio optimization, Value at Risk (VaR), credit scoring models, and high-frequency order book modeling.'
    },
    // Sem 8
    {
        code: 'DS406',
        name: 'Explainable and Trustworthy AI (XAI)',
        department_id: 2,
        credits: 3,
        semester: 8,
        description: 'Model interpretability, SHAP values, LIME local explanations, integrated gradients, adversarial attack defenses, and model auditing.'
    },
    {
        code: 'DS407',
        name: 'Autonomous Agents and Multi-Agent Systems',
        department_id: 2,
        credits: 4,
        semester: 8,
        description: 'Autonomous LLM agent frameworks (LangChain, AutoGen), tool calling, planning loops, memory states, and multi-agent coordination.'
    },
    {
        code: 'DS408',
        name: 'Applied Deep Learning Capstone Project',
        department_id: 2,
        credits: 6,
        semester: 8,
        description: 'Comprehensive machine learning capstone project covering data ingestion, modeling, hyperparameter tuning, testing, and production deployment.'
    },
    {
        code: 'DS409',
        name: 'Industry Data Science Case Studies & Practicum',
        department_id: 2,
        credits: 4,
        semester: 8,
        description: 'Real-world industry datasets analysis, stakeholder presentation, translating business metrics to technical KPIs, and executive reporting.'
    },
    {
        code: 'DS410',
        name: 'Emerging Trends in Cognitive Computing',
        department_id: 2,
        credits: 3,
        semester: 8,
        description: 'Neuro-symbolic AI, foundation model scaling laws, neuromorphic computing concepts, and current frontier research topics.'
    },
    // ==========================================
    // DEPARTMENT 3: ELECTRICAL & COMPUTER ENGINEERING (EE)
    // ==========================================
    // Sem 1
    {
        code: 'EE101',
        name: 'Fundamentals of Electric Circuits',
        department_id: 3,
        credits: 4,
        semester: 1,
        description: 'Ohm\'s law, Kirchhoff’s current and voltage laws (KCL/KVL), resistive networks, nodal and mesh analysis, and DC circuit analysis.'
    },
    {
        code: 'EE102',
        name: 'Engineering Electromagnetic Fields',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'Electrostatics, magnetostatics, Coulomb’s law, Gauss’s law, Ampere’s circuital law, Faraday’s law, and Maxwell’s equations.'
    },
    {
        code: 'EE103',
        name: 'Workshop Practice and Hardware Prototyping',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'Electronic component testing, soldering techniques, PCB breadboarding, multimeters, function generators, and safety practices.'
    },
    {
        code: 'EE104',
        name: 'Electrical Measurements and Instrumentation',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'Moving coil/iron meters, bridges (Wheatstone, Maxwell), potentiometers, instrument transformers, and digital transducers.'
    },
    {
        code: 'EE105',
        name: 'Introduction to Energy Systems',
        department_id: 3,
        credits: 3,
        semester: 1,
        description: 'Conventional and renewable energy resources, thermal, hydro, and nuclear power plant basics, and global energy consumption trends.'
    },
    // Sem 2
    {
        code: 'EE106',
        name: 'Circuit Analysis and AC Network Theorems',
        department_id: 3,
        credits: 4,
        semester: 2,
        description: 'Sinusoidal steady-state analysis, phasors, impedance, power factor, Thevenin, Norton, superposition, and maximum power transfer theorems.'
    },
    {
        code: 'EE107',
        name: 'Solid State Semiconductor Devices',
        department_id: 3,
        credits: 4,
        semester: 2,
        description: 'Semiconductor physics, PN junction diodes, Zener diodes, Bipolar Junction Transistors (BJT), and Field Effect Transistors (FET).'
    },
    {
        code: 'EE108',
        name: 'Analog Electronic Circuits (Op-Amps & Diodes)',
        department_id: 3,
        credits: 4,
        semester: 2,
        description: 'Operational amplifiers, inverting/non-inverting amplifiers, differential amplifiers, active filters, rectifiers, and oscillators.'
    },
    {
        code: 'EE109',
        name: 'Computer-Aided Circuit Simulation (SPICE)',
        department_id: 3,
        credits: 3,
        semester: 2,
        description: 'Schematic capture, DC operating point, AC frequency response, and transient simulation of analog circuits using SPICE/LTspice.'
    },
    {
        code: 'EE110',
        name: 'Electric Materials and Magnetic Circuits',
        department_id: 3,
        credits: 3,
        semester: 2,
        description: 'Magnetic materials, hysteresis loop, magnetic circuits, reluctance, core losses, dielectric materials, and insulating mediums.'
    },
    // Sem 3
    {
        code: 'EE201',
        name: 'Digital Systems and Logic Circuit Design',
        department_id: 3,
        credits: 4,
        semester: 3,
        description: 'Combinational circuit design, multiplexers, decoders, sequential circuits, shift registers, synchronous counters, and state machines.'
    },
    {
        code: 'EE202',
        name: 'Signals and Linear Time-Invariant Systems',
        department_id: 3,
        credits: 4,
        semester: 3,
        description: 'Continuous and discrete signals, linearity, time-invariance, convolution, Fourier series, Fourier transforms, and frequency response.'
    },
    {
        code: 'EE203',
        name: 'Electrical Power Generation and Transmission',
        department_id: 3,
        credits: 3,
        semester: 3,
        description: 'Overhead transmission lines, conductor parameters (R, L, C), sag calculations, mechanical design, insulators, and corona effect.'
    },
    {
        code: 'EE204',
        name: 'Electrical Machines I (DC Machines & Transformers)',
        department_id: 3,
        credits: 4,
        semester: 3,
        description: 'DC generator and motor characteristics, speed control, efficiency tests, single-phase and three-phase power transformers, and autotransformers.'
    },
    {
        code: 'EE205',
        name: 'Microprocessor 8086 and Assembly Programming',
        department_id: 3,
        credits: 3,
        semester: 3,
        description: '8086 architecture, addressing modes, assembly instruction sets, memory segmentation, interrupt handling, and peripheral interfacing (8255).'
    },
    // Sem 4
    {
        code: 'EE206',
        name: 'Electrical Machines II (Induction & Synchronous)',
        department_id: 3,
        credits: 4,
        semester: 4,
        description: 'Three-phase induction motors, rotating magnetic field, torque-speed curves, synchronous generators/motors, and alternator regulation.'
    },
    {
        code: 'EE207',
        name: 'Linear Control Systems and Stability Analysis',
        department_id: 3,
        credits: 4,
        semester: 4,
        description: 'Transfer functions, block diagrams, signal flow graphs, Routh-Hurwitz stability criterion, root locus, Bode plots, and Nyquist stability.'
    },
    {
        code: 'EE208',
        name: 'Analog and Digital Communication Engineering',
        department_id: 3,
        credits: 4,
        semester: 4,
        description: 'Amplitude and frequency modulation (AM/FM), pulse code modulation (PCM), digital shift keying (ASK, FSK, PSK), and noise performance.'
    },
    {
        code: 'EE209',
        name: 'Transmission Lines and Waveguides',
        department_id: 3,
        credits: 3,
        semester: 4,
        description: 'Transmission line wave equations, characteristic impedance, reflection coefficients, Smith charts, and rectangular waveguide modes.'
    },
    {
        code: 'EE210',
        name: 'Power Electronics and Semiconductor Switches',
        department_id: 3,
        credits: 4,
        semester: 4,
        description: 'SCRs, MOSFETs, IGBTs, phase-controlled rectifiers, DC-DC buck/boost converters, inverters, and pulse width modulation (PWM).'
    },
    // Sem 5
    {
        code: 'EE301',
        name: 'Microcontrollers and Embedded System Design',
        department_id: 3,
        credits: 4,
        semester: 5,
        description: 'ARM Cortex and AVR microcontrollers, GPIO, timers, hardware interrupts, ADC conversions, serial protocols (UART, SPI, I2C), and embedded C.'
    },
    {
        code: 'EE302',
        name: 'Digital Signal Processing (DSP) & Filters',
        department_id: 3,
        credits: 4,
        semester: 5,
        description: 'Z-transform, Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT), FIR/IIR filter design, and finite word length effects.'
    },
    {
        code: 'EE303',
        name: 'Power System Analysis and Grid Protection',
        department_id: 3,
        credits: 4,
        semester: 5,
        description: 'Per-unit systems, symmetrical components, unsymmetrical fault analysis, bus admittance matrix, protective relays, and circuit breakers.'
    },
    {
        code: 'EE304',
        name: 'Industrial Automation and PLC Programming',
        department_id: 3,
        credits: 3,
        semester: 5,
        description: 'Programmable Logic Controllers (PLCs), ladder logic programming, timers/counters, industrial sensors, and SCADA monitoring architectures.'
    },
    {
        code: 'EE305',
        name: 'Renewable Energy Systems (Solar & Wind)',
        department_id: 3,
        credits: 3,
        semester: 5,
        description: 'Photovoltaic cells, solar array characteristics, MPPT algorithms, wind turbine aerodynamics, generators, and grid interconnection standards.'
    },
    // Sem 6
    {
        code: 'EE306',
        name: 'VLSI Design and FPGA Programming with Verilog',
        department_id: 3,
        credits: 4,
        semester: 6,
        description: 'CMOS inverter characteristics, layout rules, hardware description languages (Verilog/VHDL), RTL synthesis, and FPGA implementation.'
    },
    {
        code: 'EE307',
        name: 'Internet of Things (IoT) Hardware & Sensors',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'Embedded IoT nodes (ESP32), wireless sensor interfacing, cloud MQTT telemetry, CoAP, low-power sleep modes, and edge telemetry.'
    },
    {
        code: 'EE308',
        name: 'Electric Vehicle (EV) Powertrains and Batteries',
        department_id: 3,
        credits: 4,
        semester: 6,
        description: 'EV motor drives (BLDC, PMSM), lithium-ion battery management systems (BMS), regenerative braking, charging protocols, and converters.'
    },
    {
        code: 'EE309',
        name: 'Antenna Theory and Wireless Communications',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'Dipole antennas, radiation patterns, directivity, gain, antenna arrays, cellular wireless propagation models, and 4G/5G standards.'
    },
    {
        code: 'EE310',
        name: 'Modern Switchgear and Substation Design',
        department_id: 3,
        credits: 3,
        semester: 6,
        description: 'SF6 and vacuum circuit breakers, busbar arrangements, surge arresters, grounding practices, protective relay schemes, and substation automation.'
    },
    // Sem 7
    {
        code: 'EE401',
        name: 'Smart Grid Technologies and Energy Storage',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'Advanced metering infrastructure (AMI), wide-area monitoring (PMUs), demand-response management, and grid-scale battery storage.'
    },
    {
        code: 'EE402',
        name: 'Robotics, Actuators, and Motion Control',
        department_id: 3,
        credits: 4,
        semester: 7,
        description: 'Forward and inverse kinematics, servo motor control, encoder feedback, PID position tuning, trajectory generation, and robotic arms.'
    },
    {
        code: 'EE403',
        name: 'Optical Fiber Communication Systems',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'Optical fibers, attenuation, dispersion, laser diodes, photodetectors, WDM multiplexing, and optical link budget calculations.'
    },
    {
        code: 'EE404',
        name: 'High Voltage Engineering and Testing',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'Breakdown mechanisms in gas, liquid, and solid dielectrics, generation of impulse voltages/currents, and high-voltage testing standards.'
    },
    {
        code: 'EE405',
        name: 'Biomedical Instrumentation and Biosensors',
        department_id: 3,
        credits: 3,
        semester: 7,
        description: 'Bioelectric potentials (ECG, EEG, EMG), biopotential electrodes, medical isolation amplifiers, physiological transducers, and patient safety.'
    },
    // Sem 8
    {
        code: 'EE406',
        name: 'Power Quality Management and Harmonics',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Voltage sags, swells, transients, total harmonic distortion (THD), active/passive power filters, and IEEE power quality standards.'
    },
    {
        code: 'EE407',
        name: 'Wireless Sensor Networks and Telemetry',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Ad-hoc network architectures, Zigbee, LoRaWAN long-range communications, energy-efficient routing, and distributed sensing.'
    },
    {
        code: 'EE408',
        name: 'Embedded Hardware Security and Fault Tolerance',
        department_id: 3,
        credits: 3,
        semester: 8,
        description: 'Side-channel attacks, hardware trojans, physically unclonable functions (PUFs), secure boot loaders, and fault-tolerant architecture design.'
    },
    {
        code: 'EE409',
        name: 'Major Capstone Electrical Engineering Project',
        department_id: 3,
        credits: 6,
        semester: 8,
        description: 'Hardware-in-the-loop engineering design, schematic layout, PCB fabrication, embedded firmware development, testing, and documentation.'
    },
    {
        code: 'EE410',
        name: 'Advanced Power System Operations & Economics',
        department_id: 3,
        credits: 4,
        semester: 8,
        description: 'Economic load dispatch, unit commitment, optimal power flow, deregulated electricity markets, and frequency-load control mechanisms.'
    },
    // ==========================================
    // DEPARTMENT 4: DEPARTMENT OF MATHEMATICS (MATH)
    // ==========================================
    // Sem 1
    {
        code: 'MATH101',
        name: 'Calculus I: Differential and Integral Calculus',
        department_id: 4,
        credits: 4,
        semester: 1,
        description: 'Limits, continuity, techniques of differentiation, Mean Value Theorem, Taylor series, Riemann integration, and Fundamental Theorem of Calculus.'
    },
    {
        code: 'MATH102',
        name: 'Classical Algebra and Theory of Equations',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: 'Polynomial equations, relation between roots and coefficients, Descartes’ rule of signs, symmetric functions, and Cardan’s method for cubics.'
    },
    {
        code: 'MATH103',
        name: 'Analytical Solid Geometry and Coordinate Systems',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: '3D Cartesian coordinates, planes, straight lines in space, spheres, cones, cylinders, and quadric surfaces.'
    },
    {
        code: 'MATH104',
        name: 'Vector Algebra and Coordinate Transformations',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: 'Scalar and vector products, triple products, vector differentiation, gradient, divergence, curl, and orthogonal curvilinear coordinates.'
    },
    {
        code: 'MATH105',
        name: 'Elementary Number Theory and Modular Arithmetic',
        department_id: 4,
        credits: 3,
        semester: 1,
        description: 'Divisibility, Euclidean algorithm, prime numbers, modular arithmetic, linear congruences, and Fermat’s Little Theorem.'
    },
    // Sem 2
    {
        code: 'MATH106',
        name: 'Calculus II: Multivariate and Vector Calculus',
        department_id: 4,
        credits: 4,
        semester: 2,
        description: 'Functions of several variables, partial derivatives, directional derivatives, multiple integrals, Green\'s, Stokes\', and Divergence theorems.'
    },
    {
        code: 'MATH107',
        name: 'Linear Algebra I: Matrices and Vector Spaces',
        department_id: 4,
        credits: 4,
        semester: 2,
        description: 'Vector spaces, subspaces, linear independence, basis, dimension, matrix rank, systems of linear equations, and Gaussian elimination.'
    },
    {
        code: 'MATH108',
        name: 'Ordinary Differential Equations (ODE)',
        department_id: 4,
        credits: 4,
        semester: 2,
        description: 'First-order ODEs, linear equations with constant coefficients, method of undetermined coefficients, variation of parameters, and series solutions.'
    },
    {
        code: 'MATH109',
        name: 'Sequences, Infinite Series, and Power Series',
        department_id: 4,
        credits: 3,
        semester: 2,
        description: 'Convergence tests (ratio, root, comparison), alternating series, absolute convergence, power series, and radius of convergence.'
    },
    {
        code: 'MATH110',
        name: 'Mathematical Proofs, Sets, and Logic',
        department_id: 4,
        credits: 3,
        semester: 2,
        description: 'Direct proofs, contrapositive, proof by contradiction, mathematical induction, set theory operations, relations, and equivalence classes.'
    },
    // Sem 3
    {
        code: 'MATH201',
        name: 'Partial Differential Equations (PDE)',
        department_id: 4,
        credits: 4,
        semester: 3,
        description: 'First-order linear PDEs, classification of second-order PDEs (wave, heat, Laplace equations), and method of separation of variables.'
    },
    {
        code: 'MATH202',
        name: 'Discrete Mathematics and Combinatorics',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'Permutations, combinations, pigeonhole principle, inclusion-exclusion principle, generating functions, recurrence relations, and graph structures.'
    },
    {
        code: 'MATH203',
        name: 'Real Analysis I: Limits, Continuity, and Metrics',
        department_id: 4,
        credits: 4,
        semester: 3,
        description: 'Topology of real numbers, metric spaces, open and closed sets, compactness, completeness, and uniform continuity of real functions.'
    },
    {
        code: 'MATH204',
        name: 'Linear Algebra II: Inner Products & Eigenspaces',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'Inner product spaces, Gram-Schmidt orthogonalization, eigenvalues, eigenvectors, diagonalizability, and spectral theorem for symmetric matrices.'
    },
    {
        code: 'MATH205',
        name: 'Probability Foundations and Random Variables',
        department_id: 4,
        credits: 3,
        semester: 3,
        description: 'Axiomatic probability, conditional probability, discrete and continuous random variables, probability density functions, and expectation.'
    },
    // Sem 4
    {
        code: 'MATH206',
        name: 'Complex Analysis and Conformal Mapping',
        department_id: 4,
        credits: 4,
        semester: 4,
        description: 'Analytic functions, Cauchy-Riemann equations, contour integration, Cauchy’s integral formula, Taylor/Laurent series, and residue calculus.'
    },
    {
        code: 'MATH207',
        name: 'Abstract Algebra I: Groups and Symmetry',
        department_id: 4,
        credits: 4,
        semester: 4,
        description: 'Groups, subgroups, cyclic groups, permutation groups, cosets, Lagrange’s theorem, normal subgroups, quotient groups, and group homomorphisms.'
    },
    {
        code: 'MATH208',
        name: 'Mathematical Statistics and Estimation Theory',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Point estimation, maximum likelihood estimation (MLE), unbiasedness, confidence intervals, Neyman-Pearson lemma, and hypothesis testing.'
    },
    {
        code: 'MATH209',
        name: 'Graph Theory and Network Algorithms',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Paths, cycles, Eulerian and Hamiltonian graphs, trees, planarity, graph coloring, minimum spanning trees, and shortest path algorithms.'
    },
    {
        code: 'MATH210',
        name: 'Integral Transforms (Fourier and Laplace)',
        department_id: 4,
        credits: 3,
        semester: 4,
        description: 'Laplace transforms, inverse Laplace transforms, convolution theorem, Fourier transforms, and applications to solving differential equations.'
    },
    // Sem 5
    {
        code: 'MATH301',
        name: 'Numerical Analysis and Error Estimation',
        department_id: 4,
        credits: 4,
        semester: 5,
        description: 'Root finding (Newton-Raphson, bisection), polynomial interpolation (Lagrange, Newton), numerical integration (Simpson\'s), and Runge-Kutta ODE solvers.'
    },
    {
        code: 'MATH302',
        name: 'Abstract Algebra II: Rings, Fields, and Galois',
        department_id: 4,
        credits: 4,
        semester: 5,
        description: 'Rings, integral domains, ideals, quotient rings, polynomial rings, field extensions, finite fields, and introduction to Galois theory.'
    },
    {
        code: 'MATH303',
        name: 'Real Analysis II: Riemann Integration & Measure',
        department_id: 4,
        credits: 4,
        semester: 5,
        description: 'Riemann-Stieltjes integral, sequences of functions, pointwise and uniform convergence, Weierstrass M-test, and introduction to Lebesgue measure.'
    },
    {
        code: 'MATH304',
        name: 'Differential Geometry of Curves and Surfaces',
        department_id: 4,
        credits: 3,
        semester: 5,
        description: 'Curvature and torsion of space curves, Frenet-Serret formulas, first and second fundamental forms of surfaces, and Gaussian curvature.'
    },
    {
        code: 'MATH305',
        name: 'Operations Research: Linear Programming & Simplex',
        department_id: 4,
        credits: 3,
        semester: 5,
        description: 'Formulating linear optimization models, graphical method, simplex algorithm, duality theory, sensitivity analysis, and transportation problems.'
    },
    // Sem 6
    {
        code: 'MATH306',
        name: 'Optimization Methods: Non-Linear Programming',
        department_id: 4,
        credits: 4,
        semester: 6,
        description: 'Unconstrained optimization, gradient methods, Karush-Kuhn-Tucker (KKT) conditions for constrained problems, and quadratic programming.'
    },
    {
        code: 'MATH307',
        name: 'Topology and Topological Spaces',
        department_id: 4,
        credits: 4,
        semester: 6,
        description: 'Bases and sub-bases, subspace topology, product topology, quotient spaces, connectedness, path-connectedness, and compactness.'
    },
    {
        code: 'MATH308',
        name: 'Stochastic Processes and Markov Chains',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Discrete-time Markov chains, transition probability matrices, stationary distributions, classification of states, Poisson processes, and renewal theory.'
    },
    {
        code: 'MATH309',
        name: 'Cryptographic Mathematics and Ciphers',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Discrete logarithms, elliptic curves over finite fields, Diffie-Hellman key exchange, RSA encryption mathematics, and primality testing.'
    },
    {
        code: 'MATH310',
        name: 'Mathematical Modeling in Physical Sciences',
        department_id: 4,
        credits: 3,
        semester: 6,
        description: 'Formulation of continuum models, population dynamics, predator-prey systems, stability analysis, and dimensionless analysis.'
    },
    // Sem 7
    {
        code: 'MATH401',
        name: 'Functional Analysis and Hilbert Spaces',
        department_id: 4,
        credits: 4,
        semester: 7,
        description: 'Normed linear spaces, Banach spaces, Hilbert spaces, Hahn-Banach theorem, Open Mapping theorem, and bounded linear operators.'
    },
    {
        code: 'MATH402',
        name: 'Tensor Calculus and Continuum Mechanics',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Covariant and contravariant vectors, metric tensor, Christoffel symbols, covariant differentiation, Riemann curvature tensor, and elasticity equations.'
    },
    {
        code: 'MATH403',
        name: 'Financial Mathematics: Black-Scholes & Options',
        department_id: 4,
        credits: 4,
        semester: 7,
        description: 'Arbitrage pricing theory, geometric Brownian motion, Ito’s lemma, derivation of the Black-Scholes PDE, and European option pricing.'
    },
    {
        code: 'MATH404',
        name: 'Dynamical Systems, Chaos, and Bifurcations',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Phase plane analysis, limit cycles, Poincare-Bendixson theorem, saddle-node and Hopf bifurcations, Lorenz attractor, and chaos theory.'
    },
    {
        code: 'MATH405',
        name: 'Information Theory and Coding Mathematics',
        department_id: 4,
        credits: 3,
        semester: 7,
        description: 'Shannon entropy, mutual information, channel capacity theorem, Huffman coding, linear block codes, and Reed-Solomon error correction.'
    },
    // Sem 8
    {
        code: 'MATH406',
        name: 'Algorithmic Game Theory and Mechanism Design',
        department_id: 4,
        credits: 3,
        semester: 8,
        description: 'Strategic games, Nash equilibrium, zero-sum games, minimax theorem, extensive form games, auctions, and cooperative games.'
    },
    {
        code: 'MATH407',
        name: 'Computational Fluid Dynamics & Finite Elements',
        department_id: 4,
        credits: 4,
        semester: 8,
        description: 'Navier-Stokes equations formulation, finite difference and finite element methods (FEM), grid generation, and numerical stability.'
    },
    {
        code: 'MATH408',
        name: 'Quantum Mechanics Mathematical Foundations',
        department_id: 4,
        credits: 3,
        semester: 8,
        description: 'Operator theory in Hilbert spaces, Hermitian operators, spectral decomposition, Dirac notation, and mathematical formulation of Schrödinger’s equation.'
    },
    {
        code: 'MATH409',
        name: 'Advanced Mathematics Capstone Dissertation',
        department_id: 4,
        credits: 6,
        semester: 8,
        description: 'In-depth independent mathematical research project and formal thesis writing under faculty supervision.'
    },
    {
        code: 'MATH410',
        name: 'Special Topics in Pure and Applied Mathematics',
        department_id: 4,
        credits: 4,
        semester: 8,
        description: 'Advanced seminar exploring recent discoveries in algebraic geometry, manifold topology, or scientific computing.'
    }
];
exports.COURSE_PREREQUISITES = {
    // ==========================================
    // DEPARTMENT 1: COMPUTER SCIENCE (CS)
    // ==========================================
    CS106: ['CS101'],
    CS107: ['CS103'],
    CS108: ['CS101'],
    CS109: ['CS102'],
    CS110: ['MATH101'],
    CS201: ['CS101', 'CS106'],
    CS202: ['CS106'],
    CS203: ['CS110'],
    CS204: ['CS201'],
    CS205: ['CS107'],
    CS206: ['CS201'],
    CS207: ['CS107', 'CS201'],
    CS208: ['CS106'],
    CS209: ['CS207'],
    CS210: ['CS104', 'CS204'],
    CS301: ['CS201', 'CS203'],
    CS302: ['CS207', 'CS209'],
    CS303: ['CS209'],
    CS304: ['CS202'],
    CS305: ['CS104'],
    CS306: ['CS302'],
    CS307: ['CS109', 'CS210'],
    CS308: ['CS204'],
    CS309: ['CS208'],
    CS310: ['CS210', 'CS302'],
    CS401: ['CS302'],
    CS402: ['CS303'],
    CS403: ['CS201', 'CS303'],
    CS404: ['MATH107', 'CS206'],
    CS405: ['CS201'],
    CS406: ['CS310'],
    CS407: ['CS206'],
    CS408: ['CS208'],
    CS409: ['CS208', 'CS206'],
    CS410: ['CS208'],
    // ==========================================
    // DEPARTMENT 2: DATA SCIENCE & AI (DS)
    // ==========================================
    DS106: ['DS102'],
    DS107: ['DS105'],
    DS108: ['DS101'],
    DS109: ['MATH101'],
    DS110: ['DS101'],
    DS201: ['DS106', 'DS109'],
    DS202: ['DS109'],
    DS203: ['DS108'],
    DS204: ['DS110'],
    DS205: ['DS106', 'DS109'],
    DS206: ['DS201'],
    DS207: ['DS110'],
    DS208: ['DS108', 'DS102'],
    DS209: ['DS101'],
    DS210: ['DS204'],
    DS301: ['DS201'],
    DS302: ['DS201'],
    DS303: ['DS201'],
    DS304: ['DS201'],
    DS305: ['DS201'],
    DS306: ['DS301'],
    DS307: ['DS302'],
    DS308: ['DS201', 'DS202'],
    DS309: ['DS301'],
    DS310: ['DS107', 'DS203'],
    DS401: ['DS301'],
    DS402: ['DS301'],
    DS403: ['DS301'],
    DS404: ['DS201'],
    DS405: ['DS207'],
    DS406: ['DS301'],
    DS407: ['DS307'],
    DS408: ['DS301', 'DS303'],
    DS409: ['DS206'],
    DS410: ['DS301'],
    // ==========================================
    // DEPARTMENT 3: ELECTRICAL ENGINEERING (EE)
    // ==========================================
    EE106: ['EE101'],
    EE107: ['EE101'],
    EE108: ['EE107'],
    EE109: ['EE101'],
    EE110: ['EE102'],
    EE201: ['EE108'],
    EE202: ['EE106'],
    EE203: ['EE106'],
    EE204: ['EE106', 'EE110'],
    EE205: ['EE201'],
    EE206: ['EE204'],
    EE207: ['EE202'],
    EE208: ['EE202'],
    EE209: ['EE102'],
    EE210: ['EE108'],
    EE301: ['EE201', 'EE205'],
    EE302: ['EE202'],
    EE303: ['EE203'],
    EE304: ['EE201'],
    EE305: ['EE203'],
    EE306: ['EE201'],
    EE307: ['EE301'],
    EE308: ['EE210', 'EE206'],
    EE309: ['EE209'],
    EE310: ['EE303'],
    EE401: ['EE303'],
    EE402: ['EE207'],
    EE403: ['EE208'],
    EE404: ['EE303'],
    EE405: ['EE108'],
    EE406: ['EE210'],
    EE407: ['EE307'],
    EE408: ['EE301'],
    EE409: ['EE301', 'EE210'],
    EE410: ['EE303'],
    // ==========================================
    // DEPARTMENT 4: MATHEMATICS (MATH)
    // ==========================================
    MATH106: ['MATH101'],
    MATH107: ['MATH102'],
    MATH108: ['MATH101'],
    MATH109: ['MATH101'],
    MATH110: ['MATH102'],
    MATH201: ['MATH108'],
    MATH202: ['MATH110'],
    MATH203: ['MATH106', 'MATH110'],
    MATH204: ['MATH107'],
    MATH205: ['MATH106'],
    MATH206: ['MATH203'],
    MATH207: ['MATH102', 'MATH110'],
    MATH208: ['MATH205'],
    MATH209: ['MATH202'],
    MATH210: ['MATH108'],
    MATH301: ['MATH107', 'MATH108'],
    MATH302: ['MATH207'],
    MATH303: ['MATH203'],
    MATH304: ['MATH106'],
    MATH305: ['MATH107'],
    MATH306: ['MATH106', 'MATH107'],
    MATH307: ['MATH203'],
    MATH308: ['MATH205'],
    MATH309: ['MATH105', 'MATH207'],
    MATH310: ['MATH201'],
    MATH401: ['MATH203', 'MATH204'],
    MATH402: ['MATH106', 'MATH204'],
    MATH403: ['MATH108', 'MATH205'],
    MATH404: ['MATH108'],
    MATH405: ['MATH205'],
    MATH406: ['MATH305'],
    MATH407: ['MATH201', 'MATH301'],
    MATH408: ['MATH204', 'MATH401'],
    MATH409: ['MATH203', 'MATH207'],
    MATH410: ['MATH302']
};
