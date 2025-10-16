pipeline {
    agent any

    environment { 
        registryCredentials = "nexus"
        registry = "localhost:8083"
        dockerhubRegistry = "tare9/angappp"
        dockerhubCredentials = "dockerhub_id"
        dockerImage = '' 
    }

    stages {
        stage('Git Checkout') {
            steps {
                echo 'Pulling from GitHub'
                git(
                    branch: 'sadok',
                    url: 'https://github.com/dhia-coder/DEVOPSS-ANGULAR.git'
                )
            }
        }

        stage('Build Development') {
            steps {
                script {
                    // Navigate to the Angular project directory
                    dir('fuse-starter-v18.0.0') {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'scanner'
                    // Run SonarQube analysis from the Angular project directory
                    dir('fuse-starter-v18.0.0') {
                        withSonarQubeEnv('scanner') {
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') { 
            steps { 
                script { 
                    // Build Docker image from the Angular project directory
                    dir('fuse-starter-v18.0.0') {
                        dockerImage = docker.build("${registry}/nodeapp:6.0") 
                    }
                } 
            } 
        }

        stage('Login and Deploy to Nexus') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                        echo $NEXUS_PASS | docker login -u $NEXUS_USER --password-stdin http://${registry}
                        docker push ${registry}/nodeapp:6.0
                        """
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                // Run docker-compose from the Angular project directory
                dir('fuse-starter-v18.0.0') {
                    sh 'docker-compose up -d'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', dockerhubCredentials) {
                        // Retag l'image pour Docker Hub
                        sh """
                        docker tag ${registry}/nodeapp:6.0 ${dockerhubRegistry}:6.0
                        docker tag ${registry}/nodeapp:6.0 ${dockerhubRegistry}:latest
                        """
                        // Push des deux tags
                        sh "docker push ${dockerhubRegistry}:6.0"
                        sh "docker push ${dockerhubRegistry}:latest"
                    }
                }
            }
        }
    }
}
