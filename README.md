Docker commands:

Build (in root directory):
'''
docker build -t <tag name> .
'''

Tag container:
'''
docker tag <tag name> equipmentportalcontainer.azurecr.io/<container name>
'''

Push container to Azure container Registry:
'''
docker push equipmentportalcontainer.azurecr.io/<container name>
'''
