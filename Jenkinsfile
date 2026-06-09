pipeline {
    agent any

    environment {
        IMAGE = "prolink-web:${BUILD_NUMBER}"
        CONT = "prolink-web"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE% .'
            }
        }

        stage('Run Container') {
            steps {
                bat 'docker rm -f %CONT%'
                bat 'docker run -d --name %CONT% -p 4200:80 %IMAGE%'
            }
        }
    }
}