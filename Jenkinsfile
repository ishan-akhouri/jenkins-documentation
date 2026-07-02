pipeline {
  agent any
  environment {
    IMAGE = "ishanakhouri/jenkins-documentation:${env.BUILD_NUMBER}"
  }
  stages {
    stage('Trivy Image Scan')    { steps { echo 'placeholder' } }
    stage('Deploy Dev')          { steps { echo 'placeholder' } }
    stage('ZAP DAST')            { steps { echo 'placeholder' } }
    stage('Approve Prod Deploy') { steps { input 'Deploy to prod?' } }
    stage('Deploy Prod – Canary'){ steps { echo 'placeholder' } }
  }
}
