WAIA - Whatsapp AI Assistant

This aplication connects to a Whatsapp Account via Linked Devices Feature (scan QR code at the time of initilizaiton)
and when any msg is received, program trys to respond to it using a selected LLM via Ollama.

Initialization:
on first run, program will ask to scan a qr code in the terminal with your whatsapp linked device scanner
to establish a connection.
once connected, the app reads the config.json(from /usr/src/app/Data/ ) file for basic configuration details.
Programs needs atleast 
    i.      the admin(wa username / accountnumber =~ countrycode+contactnumber )
    ii.     the ollama endpoint
    iii.    default model 
to start with.
Please change the dummy values in the config.json file with your specific values.

After Initialization completes a message is logged: Whatsapp bot connected.
Now the program is ready to respond to any msg received.

Config Features:

Admin: 
    Admin is the contact who will have Admin commands access to alter the config file. Commands(Discussed later) start with !.
Recipient:
    Name of the Account owner, who the AI should impersonate as.
Locaiton: 
    Admin Location information for contextual awareness for the AI
TimeZone:
    Admin TimeZone info for contextual awareness for the AI
SelectedModel: 
    Default Model for LLM query
Debug:
    If set to true, application log will have more messages.
APIFolder:
    path for the API folder. API folder contains external data sources that the AI can use for real time reference.
Ollama Url:
    The Ollama endpoint
InvertIgnore:
    This is related to the IgnoreContacts list. If set to true, 
    program will only respond to contacts maintained in the IgnoreContacts list.
IgnoreContacts:
    This is a array of contacts for whom program will not respond.
HCount:
    Number of messages from conversation history to consider for contextual awareness.
PromptsFilePath:
    Path for the Prompts file. Prompts from this file is used to make queary to the LLM.
PromptsReloadIntervalMs:
    at what frequency to check for changes in the prompt file and reload.


The Admin Commands:

!model:
    This command displays a list of available LLMs currently in Ollama and allows to select any one of them as default LLM for responses.
!admin:
    This command allow to delidate the admin priviledges to another contact.
    Command: !admin <user_name>
!ignore:
    This command allows to add any contact/group to ignore list. Once ignored program does not respond to that contact any more.
    Command: !ignore <user_name> / <user_id> / <countrycode+number>
!ignorelist:
    This command will list all the contacts which are added to the list to ignore.
!unignore:
    This command will let the admin remove a contact from the ignore list.
    Command: !unignore <user_name> / <user_id> / <countrycode+number>
!prompt:
    This command allows to add remove modify prompts which are being used to call the LLM.
    
    The prompt file:  
        The prompt file should always contain some default prompts. The default prompts are the generic prompts that are 
        going to be used to make the LLM calls for all contacts.

        There are 4 main prompt sets.
        1. Memory Check:
           This set of prompts are used to build the system context to determine if the user query needs conversation history
           for context. This is the 1st query to the LLM.

        2. Tag Check:
            This set of prompts are to help the AI beter process the list of API Tags and determine 
            if the AI needs to call any of the available APIs for external data for context enrichment.

        3. API Check:
            This set of prompts are used to help the API prepare proper payloads for each of the API it has to call
            to fetch necessary external/realtime data
        4. Response Check
            This is the final System prompt that will be used to get the response from the AI which will be sent back to the contact.

        Additionaly under the default category there are 2 more prompt sets.
        5. About_Admin
            This set is used to provide PII about the Admin for context enrichment in the above 4 cases on a need basis.
        6. Add_Info
            This set is used to provide adiitonal any kind of information related to the Admin 
            for context enrichment in the above 4 cases on a need basis.

    To customize these prompts for any contact, separate prompts can be added under the contact's name/id.
    for any of the 6 Prompt types, if a contact specific prompt set is found, that will take precedence over the default prompt.

    Command: !prompt Add <contact> <prompt_Type> <prompt text>
    in order to add new statement to a prompt type for a contact.
    in order to override the default value for the prompt type, simply send default as the contact.

    Command: !prompt list <Contact>
    This will list all the prompts for each prompt type for that specific contact of default.

    Command: !prompt remove <contact> <prompt_Type> <prompt_number>
        This will delete the line from the promptlist using the prompt number. 
        prompt number can be identified from the prompt list.
!webui:
    There is a webUI added to manage the configs and prompts.
    The webui can be enabled disabled by the admin using commands.
    
    Command: !webui on ('true' is also accepted)
    This will run the webui on port 3000. this port needs to be mapped out in the docker config.

    Command: !webui off ('false' is also accepted)
    This will stop the webui.

APIs:

Since local models will not have realtime data or analytic features,
this proram tries to address that gap by establishing a capability of calling external APIs for data enrichment.
We have an APIs folder. the path of this folder is determined based on the config attribute APIFolder.

we have just included a Time API and a Weather API as example.
more APIs can be added just by placing a josn file with api details in correct format.
Program uses the tags from the api fiels and allows the LLM to determine which tags are relevant for the current user query.
Then those APIs are called using the API payload built by the LLM and the respnses are absorbed by the LLM for final response.

---
The program doest directly implement a RAG and also Tools/Functions of certain LLMs are not utilized and external data extraction
is handled by the program itself. 
This current approach allows the program to be lightweight and less resouce intensive for the purpose.
Ofcourse we will continue to enhance the program to Implement proger RAG, vector Storage and LLM Funcitons along with other AI frameworks.

Note:
This is a completely vive coded app.
Consider this as a very early beta.
All these years of selfhosting so many applications, this is kind of a opportunity for me to contribute back to the community.
Please try out the app.
Please share your valuable feedback and errors that you face.

        

