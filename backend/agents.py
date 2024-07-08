from crewai import Agent, Task, Crew
from crewai_tools import SerperDevTool
import os
import base64

# Set your OpenAI API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

def create_crew(documents, instructions):
    search_tool = SerperDevTool()

    document_analyzer = Agent(
        role='Document Analyzer',
        goal='Analyze documents and extract key information',
        backstory='You are an expert in document analysis with years of experience in extracting and interpreting information from various types of documents.',
        verbose=True,
        allow_delegation=False,
        tools=[search_tool]
    )

    information_extractor = Agent(
        role='Information Extractor',
        goal='Extract specific fields from analyzed documents',
        backstory='You specialize in identifying and extracting specific pieces of information from complex documents, ensuring accuracy and completeness.',
        verbose=True,
        allow_delegation=False
    )

    analysis_task = Task(
        description=f'Analyze the following documents and provide a summary of their contents: {documents}',
        agent=document_analyzer
    )

    extraction_task = Task(
        description=f'Extract the required fields (name, CI series, CNP) from the analyzed documents. Follow these instructions: {instructions}',
        agent=information_extractor
    )

    crew = Crew(
        agents=[document_analyzer, information_extractor],
        tasks=[analysis_task, extraction_task],
        verbose=2
    )

    return crew

def process_documents(documents, instructions):
    decoded_documents = []
    for doc in documents:
        content = base64.b64decode(doc['content']).decode('utf-8')
        decoded_documents.append({
            "name": doc['name'],
            "content": content
        })

    crew = create_crew(decoded_documents, instructions)
    result = crew.kickoff()

    # Parse the result to extract the fields
    extracted_fields = {
        "name": "",
        "ci_series": "",
        "cnp": ""
    }
    
    # Here you would implement the logic to parse the result and populate extracted_fields
    # For demonstration purposes, let's assume the agents return a formatted string
    if "Name:" in result:
        extracted_fields["name"] = result.split("Name:")[1].split("\n")[0].strip()
    if "CI Series:" in result:
        extracted_fields["ci_series"] = result.split("CI Series:")[1].split("\n")[0].strip()
    if "CNP:" in result:
        extracted_fields["cnp"] = result.split("CNP:")[1].split("\n")[0].strip()

    return {
        "result": result,
        "extracted_fields": extracted_fields
    }