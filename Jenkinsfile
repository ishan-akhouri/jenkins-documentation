pipeline {
  agent any
  environment {
    IMAGE = "ishanakhouri/jenkins-documentation:latest"
  }
  stages {
    stage('Trivy Image Scan') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-pat',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            docker login -u $DOCKER_USER -p $DOCKER_PASS
            docker pull ishanakhouri/jenkins-documentation:latest
            docker run --rm \
              aquasec/trivy:latest image \
              --exit-code 1 \
              --scanners vuln,secret \
              --severity HIGH,CRITICAL \
              ishanakhouri/jenkins-documentation:latest
          '''
        }
      }
    }
    stage('Deploy Dev') {
      when { branch 'main' }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            helm upgrade --install jenkins-documentation-dev \
              ./helm/jenkins-documentation \
              --namespace jenkins-dev \
              --set image.tag=latest \
              --set image.repository=ishanakhouri/jenkins-documentation \
              --wait
          '''
        }
      }
    }
    stage('ZAP DAST') {
      when { branch 'main' }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            kubectl run zap-scan \
              --image=ghcr.io/zaproxy/zaproxy:stable \
              --namespace=jenkins-dev \
              --restart=Never \
              --rm \
              --attach \
              -- zap-baseline.py \
              -t http://jenkins-documentation-dev.jenkins-dev.svc.cluster.local:3000 \
              -I
          '''
        }
      }
    }
    stage('Approve Prod Deploy') {
      when { branch 'main' }
      steps {
        timeout(time: 1, unit: 'DAYS') {
          input message: 'Deploy to production?', ok: 'Proceed'
        }
      }
    }
    stage('Deploy Prod - Canary') {
      when { branch 'main' }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            helm upgrade --install jenkins-documentation-prod \
              ./helm/jenkins-documentation \
              --namespace jenkins-prod \
              --set image.tag=latest \
              --set image.repository=ishanakhouri/jenkins-documentation \
              --set rollout.enabled=true \
              --wait
            kubectl argo rollouts status jenkins-documentation-prod \
              --namespace jenkins-prod \
              --timeout 5m
          '''
        }
      }
    }
    stage('Mock Smoke Test') {
      when { branch 'main' }
      steps {
        echo "Running production smoke tests..."
        sh 'exit 1'
      }
    }
  }
  post {
    success {
      emailext(
        to: 'ishan.akhouri@gmail.com',
        subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "Pipeline passed. Build: ${env.BUILD_URL}"
      )
    }
    failure {
      echo "Pipeline or smoke tests failed! Forcing Argo Rollouts to abort and rollback..."
      withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
        sh 'kubectl argo rollouts abort jenkins-documentation-prod -n jenkins-prod || true'
      }
      emailext(
        to: 'ishan.akhouri@gmail.com',
        subject: "FAILED & ROLLED BACK: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "Pipeline failed. Argo Rollouts has automatically aborted the canary and reverted traffic. Check build: ${env.BUILD_URL}"
      )
    }
  }
}
