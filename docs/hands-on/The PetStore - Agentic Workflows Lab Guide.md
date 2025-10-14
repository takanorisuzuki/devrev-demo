![][image1]

The PetStore 

Agentic Workflows Lab Guide 

Author: Martijn Bosschaart (martijn@devrev.ai) 

Version: 1.0 | Release Date: 11-jul-2025 

**Confidentiality Notice** 

This document contains proprietary and confidential information intended solely for the use of the DevRev employees  and employees of DevRev partners. Unauthorized distribution, duplication, or disclosure of any portion of this  document is strictly prohibited without the express written consent of DevRev. The information contained within is  strictly for internal use only and may not be used or shared with third parties without prior permission.  
![][image2]The PetStore: Agentic Workflow Lab Guide 

Table of Contents 

Introduction ............................................................................................................3 1.1 Setting up PLuG.................................................................................................... 4 2\. PetStore account setup and integration ...................................................................... 24 3\. PetStore workflow scenarios ............................................................................29 3.1 Setting up basic prompts and skills. ..........................................................30 3.1.1 Setting the basic prompt ...................................................................30 3.1.2 Add supporting workflows .................................................................32 3.1.3 Add Ticket handling skills...................................................................42 3.1.4 Adjusting the assignee.......................................................................45 3.1.5 Testing conversation hand-off............................................................46 3.1.6 Testing Ticket creation.......................................................................47 3.1.7 Extending interactions with Snap-Ins .................................................48 3.2 Extending the Agents responsibilities .........................................................50 3.2.1 Expanding the prompt .......................................................................50 3.2.2 Add new skills ...................................................................................51 3.2.3 Analyzing Workflow Runs...................................................................52 3.3 Setting up an advanced procedure and workflows ....................................53 3.3.1 Adding the workflow descriptions to the prompt................................53 3.3.2 Importing the workflows.....................................................................54 3.3.3 Adding articles to the Knowledge Base..............................................55 3.3.4 Testing the workflows........................................................................56 3.4 Adding extra utility skills.............................................................................59 3.4.1 Order Status and Tracking info workflows..........................................59 3.5 Adding a password reset function. ............................................................60

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 2 ![][image3]**  
**![][image4]**The PetStore: Agentic Workflow Lab Guide 

Introduction  

Welcome to the PetStore\! 

The PetStore is a fictional store and services frontend, designed for comprehensive  training on DevRev Workflows and Automations, and allows you to build a solid  understanding of Conversational Customer Experience and Customer Support use cases. 

The PetStore site is fully based on an API backend, allowing for easy integration with  DevRev. It also allows you to hook up your own Devrev Org to it, without the need to  completely reconfigure the website. Multiple users can work with the solution in different  configurations at the same time. 

By default, the PetStore is connected to the petstore org, which already is configured with  agents, workflows and kb articles so you can get a feel for the possibilities. 

This lab guide will describe the following: 

● How to use the PetStore 

● What scenarios can you ask PLuG? 

● How to set up your account, and customize it for your own org. 

● How to use the API Documentation, and set up workflows with the PetStore. 1\. Preparing your DevRev org  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 3 ![][image5]**  
**![][image6]**The PetStore: Agentic Workflow Lab Guide 

First we need to perform a basic configuration in the DevRev org to prepare it for  integration with the PetStore. 

1.1 Setting up PLuG  

**Step 1\.**  

➔ Log into your DevRev account and select the org which you want to integrate into  the PetStore, 

Note: If you don’t have a DevRev account or org yet, you can create a brand new one by  visiting https://devrev.ai and register for an account and org there. 

**Step 2\.** 

Let’s first change the appearance of the default avatar, which is used in conversations.  

➔ Go to the **Settings** menu by clicking on the cogwheel icon next to your initials in  the top left of your screen.  

➔ Then in the menu options, click on the **General** option. This opens the following  window: 

![][image7]  
➔ Click **Edit details** and change the Org Name to PetStore. Then also upload the  AI-VET\_avatar.png file from the Assets subdirectory of the PetStore  Materials.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 4 ![][image8]**  
**![][image9]**The PetStore: Agentic Workflow Lab Guide ![][image10]  
➔ Finally, click **Update**. 

**Step 3\.**  

➔ Select the **PLuG Chat** menu option under the **PLuG & Portal** section. 

➔ On the configuration tab you will find **Your unique app ID**. Copy this to a note for  use later. 

![][image11]**Step 4\.**   
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 5 ![][image12]**  
**![][image13]**The PetStore: Agentic Workflow Lab Guide 

➔ Click on the **Styling tab** and then upload a new Brand Logo. Use the  Petstorelogo.png from the Assets subfolder in the PetStore Materials.  Feel free to also change the Appearance and Accent Color to your liking so you  really know it’s “your” PLuG that is linked to PetStore later on. 

![][image14]➔ To save this, click the **Save and Publish** button on the top right of your screen.  You can then also choose to visit the extended playground to test PLuG. **Step 5\.** 

➔ On the Tabs tab, enable **Help**. Again click **Save and Publish**. 

**Step 6\.** 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 6 ![][image15]**  
The PetStore: Agentic Workflow Lab Guide 

➔ On the **Layout** tab, click the little arrow pointing down in the **Search** box. This  opens up a couple of extra options. Switch on both **Turing Search** and **Open  Articles within PLuG**. 

**Step 7\.**  

➔ Modify the “**Your in-app Support Center**” card. 

➔ Upload a new graphic for it. Use the AICustomerSupportNudge.png image  from the Assets folder in the PetStore source. 

➔ Then change the title to “*AI support for you and your pet\!*” and the description to  “*Our AI-Vet is ready to assist you\!*”. 

➔ Edit the second card, and use the AI-VetNudge.png as the graphic. 

➔ Give it the title “*Make appointments directly with our AI-VET\!*” and give it a  description of “*No more filling in boring forms, just talk to the AI-VET\!*”. 

➔ Add the link “https://petstore.devrev.community/appointments/”. 

➔ Finally, click the **Save** and **Publish**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 7**   
The PetStore: Agentic Workflow Lab Guide 

**Step 8\.**  

➔ Select the PLuG Nudges option. 

Now we are going to add three so-called Nudges. These can either be text banners  showing at the top of your screen, or full cards with images and text with anchor off the  PLuG launcher icon. You can use these to invoke user action or schedule info impressions  at scheduled intervals and all originate from PLuG so no need to modify your website. 

➔ Click **\+Nudge**. 

➔ Select the type **SpotLight** and click **Create**. 

➔ On the content tab, give it a title on the top line (click the pencil to edit), i.e.  “*Product Support*”.  

➔ Fill in the title “*Product Support*” and the Description “*Need help with a product?  Ask us\!*”. 

➔ as cover image upload the needhelp\_nudge.jpeg from the PetStore source’s  Assets folder 

➔ as Action choose **Open widget**. 

➔ Via the Rule tab, add a **Page rule**, and set the URL to “**is**” and then  **https://petstore.devrev.community/products/** . Leave everything else empty.  This will cause the nudge to show immediately when you enter the products page.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 8**   
The PetStore: Agentic Workflow Lab Guide 

➔ Save this nudge, by clicking the **Publish** button on the top right of your screen. 

➔ For the 2nd Spotlight nudge, use the name “*AI Customer & Pet Support*”, the title  “*Our AI-VET is ready to assist you*”, and as the cover image upload the  AICustomerSupportNudge.png file.  

➔ The **Action** should be “**Open Widget**”. 

➔ On the **Rules** tab set the url to match **https://petstore.devrev.community/** and  set **When to send** to *2* (which indicates a 2 second delay before showing.  ➔ **Publish** the nudge. 

➔ For the 3rd Spotlight nudge use the name “*AI-VET*”, the title “*AI-VET  Appointments\!*”, and upload the AI-VET.png image as cover. The **Action** should  be **Open Widget**.  

➔ On the rules page, match the url to  

**https://petstore.devrev.community/appointments/** with *2* second delay and  **Publish** the nudge. 

Feel free to add a banner spotlight of your choice. 

**Step 9\.**  

➔ Click on **PLuG Tokens** in the menu on the left.  

➔ Then click on the **New Token** button inside the Application access tokens box. We  need this token to be able to have PLuG authenticated users. 

➔ Give it a name and an expiry and click on **Generate**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 9**   
The PetStore: Agentic Workflow Lab Guide   
➔ Once generated, copy the key to a note, as you won’t be able to see it again and  we need it later. 

**Step 10\.**  

➔ Click on the **Session Replays** menu option. This will allow us to enable Session  Analytics for the site, which are recorded through PLuG. 

➔ Select the **Web** tab and set Session Recordings to **on**. 

➔ Click **Save and Publish**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 10**   
The PetStore: Agentic Workflow Lab Guide   
Congrats\! PLuG is now completely set up\! 1.2 Configure an Agent for PLuG  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 11**   
The PetStore: Agentic Workflow Lab Guide 

To be able to have PLuG respond, we first need to create an Agent and then a workflow  that routes the PLuG conversation to that Agent. 

**Step 1\.** 

➔ Log into your DevRev org and go to the Agents option in the Settings menu. 

| PRE-GA NOTE: |
| :---- |
| Before you see the new agent builder and the new node types required, you need to  have the new Agent builder features enabled via a Pull Request (see  **https://github.com/devrev/archon-policy/pull/10652** for an example) and  afterwards set two feature flags to true via the Control Panel, beeing  experience.ui\_workflows\_delay\_operation\_enabled and   workflow\_engine.include\_operation\_in\_list |

The Agent Builder will not have any agents yet if this is the first time you use your org. **Step 2\.**  

➔ Click on the **\+Agent Actions** button on the top right of your screen. ➔ Upload an avatar, and give the Agent a name, i.e. “*Customer Support Agent*” 

➔ Then give it a goal for example: “*Customer facing support agent, to help customers  by answering questions and helping them with inquiries about pets, products and  appointments.*”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 12**   
The PetStore: Agentic Workflow Lab Guide ➔ When done, click **Update Agent**. 

We now have an initial agent setup with a very basic prompt.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 13**   
The PetStore: Agentic Workflow Lab Guide 

**Step 3:**  

For now we are going to make a small change to the default prompt that allows us to test  the setup a bit later.  

➔ Click on the “**Instructions**” pane. When it’s selected, a button “**Edit Instructions**”  becomes available. Click it. 

➔ Add an additional line that tells it to always open with a certain greeting. For  example “*Always greet the customer with Howdy\!*” or something else that you’d  like. 

➔ When done, click **Save changes**. You can now test this, by typing anything in the  test pane on the right. Try this now. 

Perfect, our agent is following our instructions\! 

**Step 3\.** 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 14**   
The PetStore: Agentic Workflow Lab Guide 

The next thing we want to do is add Knowledge. In this case we want the Agent to be able  to tap into Articles we are going to add a bit later into the Knowledge Base. 

➔ Go back to the main Agent screen where you can then click on the **Knowledge** pane. 

➔ In the next screen click “**Add Knowledge**” , then click on the **DevRev** button.  These are all the resources within DevRev that are currently available to the agent .  

➔ From the list of objects, only select **Article** at this time, and then click **Add  knowledge**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 15**   
The PetStore: Agentic Workflow Lab Guide   
You should now see the Article category being attached to the Agent as a Knowledge  Source. 

**Step 5\.**  

We now need to create a Knowledge base article to test. 

➔ Go back to the **Settings** menu, and navigate to **Knowledge Base**.  ➔ Click on the **\+Article** button in the top right of your screen. 

The article we are going to create is going to be based on a PDF file we are going to  upload. 

➔ Enter the following information: 

Title: *My New Dog* 

Description: *A Kids Guide to Having a Happy Dog and Lifelong Companion.* Part: **Default Product** 

Owner: yourself 

Visible to: **Customers** (this means to everyone that can talk to the agent). 

➔ Choose to upload a file and provide the my-new-dog-pdf-version.pdf file  from the Assets subfolder in the PetStore Materials. 

➔ When the upload is complete, **Publish** the article via the button at the top right of  your screen.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 16**   
The PetStore: Agentic Workflow Lab Guide   
The article is now published, and the PDF is beeing indexed. This is a relatively small PDF  and indexing just takes a few seconds. 

➔ To test if the document is properly added into the **Knowledge Graph**, go back to  the **Agent Builder** and select your agent. 

➔ Open a new chat, and ask the following: “*What are some nice activities for dogs?*”,  and ask it in a follow up question where it got its information from. 

If everything went correctly and the PDF was indexed, the agent will answer with the exact  knowledge from the PDF as shown in the next screenshots:

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 17**   
The PetStore: Agentic Workflow Lab Guide   
You can now verify this information to be correct by opening the PDF itself. On page 5 and  6 you should find this exact information. The agent is now set up to also handle our  knowledge based questions. We will add more knowledge later. 

1.3 Conversation routing from PLuG to Agent

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 18**   
The PetStore: Agentic Workflow Lab Guide 

The final thing to do is to make sure that any conversations that originate from PLuG are  routed to the correct agent. 

For this we are going to make a Trigger based workflow. Triggers are events in the DevRev  system, like a ticket being created, but also a conversation being started. We can use this  event to pick up the conversation start and route it to a Talk to Agent node. 

**Step 1\.**  

➔ Go to the **Workflows** option in the **Settings** menu. 

When we start out, there are no workflows in either the Active, Paused or Draft tabs. ➔ Click on the **\+ Workflow** button on the top right of your screen. 

We can now either make the workflow needed by hand, or you can import the workflow  from a template that is provided in the Workflows folder of the PetStore Materials. 

For the sake of time, as we are going to create more workflows later we are going to  import from a template 

➔ Click on **Import Workflow Start with a pre-configured worklow**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 19**   
The PetStore: Agentic Workflow Lab Guide 

➔ Browse to the TalkToAgentWorkflow.json file in the Workflows subfolder  of the PetStore Mayterials. 

The workflow will now open on the canvas, with two nodes, **Conversation Created** and  **Talk to Agent.** We will make a few modifications to this. 

**Step 2\.** 

➔ Click the pencil in the top right hand section of the screen. 

➔ Change the name to *RoutePLuGtoAgent.* 

➔ Enter a brief description, i.e. *routes PLuG conversations to Customer Support  Agent.* 

➔ To save this, click the x top right corner of the window. 

Since this triggers on all Conversations that are created, which might also be from other  channels such as Email or Slack for example, you can add a Control / logic node to it so  the rest of the workflow will only be carried out if the channel is PLuG. For now we leave it  as is. 

**Step 3\.** 

➔ Click on the **Talk to Agent** node to open up its configuration.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 20**   
The PetStore: Agentic Workflow Lab Guide 

➔ Make sure the **Agent ID** is set to the correct agent you created. If you started this  exercise in a completely empty org, it should show **AGENT-1**. 

➔ All the other options are already correctly set, but free to investigate. ➔ When done, close the window and click the **Deploy** button. 

The gui should briefly show the indicator “*Activating*” at the top of the screen and then  open the version history pane. 

**Step 4\.**  

➔ Click on **Edit Workflow** 

➔ It will then ask to create a new version, so do.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 21**   
The PetStore: Agentic Workflow Lab Guide 

➔ When in edit mode, click the pencil icon on the top right. 

➔ You can now edit the display name of the Workflow as well as its icon. Change it to  “*AI-VET*” and upload the AI-VET avatar. 

➔ Close the window when done, and **Publish** the Workflow again. 

**Step 5\.**  

When it’s done publishing, we can test PLuG. 

➔ Navigate to the **PLuG Chat** menu option in the Setting menu. 

Important: since we created the workflow to only talk to external (or “rev” users), we need  to use the external PLuG playground. The PLuG in this window uses your dev-user  credentials so it won’t respond. 

➔ Click on the **View in Playground** button at the bottom of the screen. ➔ Click **Proceed**. 

The PLuG Playground will now open. 

➔ Click on **Send us a message** and say “*hi*”. 

If all went well, the agent will now reply as the AI-VET and say “Howdy\!”.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 22**   
The PetStore: Agentic Workflow Lab Guide   
Congrats, PLuG is now properly connected to our Customer Success Agent\!

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 23**   
The PetStore: Agentic Workflow Lab Guide 

2\. PetStore account setup and integration 

The Petstore hosted site can be accessed via https://petstore.devrev.community, but can  also be easily hosted elsewhere, and even locally as a docker container, exposed via a tool  like Ngrok.  

You do not need a user account to browse the site, but certain functions, such as placing  orders or appointments won't work until you have registered your own account, and you  won't have access to the API Documentation either if you don't log in.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 24**   
The PetStore: Agentic Workflow Lab Guide 

PLuG has been set up with session token functionality, which means the page will retrieve  a session token and pass it to PLuG, if you have logged into the system. This means only  logged in users are identified, passers by remain anonymous. 

Workflows have been configured to deal with this, and PLuG will ask you to register for an  account if needed. All registered users will automatically be assigned an API Key which will  be retrieved by PLuG to further perform workflows in the context of the user if that is  required (i.e. booking an appointment, or retrieving order information).  

**Step 1\.** 

➔ To register for an account, click on the **register here** link just under the main login  form.  

➔ Fill in all the details and once submitted, after which you will be required to activate  your account via the email address you provided.  

Or: you can talk to PLuG and ask it to register an account for you\!  

**Step 2\.**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 25**   
The PetStore: Agentic Workflow Lab Guide 

➔ Once activated you can login and the first time you do so, you will see a red banner  at the top of the screen (and notice there is no PLuG launcher visible). 

➔ To do this click **Complete Setup**.  

This will take you to your account setup screen: 

**Step 3\.**  

At this point you can choose (but change later if needed) if you want to inherit the global 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 26**   
The PetStore: Agentic Workflow Lab Guide 

DevRev config (which ties your account to the pre-existing PetStore org, or if you want to  provide your own PLuG App ID and Application Access Token. 

For the sake of this lab exercise, we are going to choose to use our own org. ➔ Uncheck **Use the global DevRev configuration** tickbox. 

➔ Enter your own PLuG App ID and AAT 

➔ Click **Save DevRev Settings** 

➔ Click **Log Out Now** and login again to activate. 

From this point onwards your account is "Linked” to the DevRev org (which will be shown  in your User Profile after you complete your first login after choosing your settings). Also an  API key is now generated for your user account.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 27**   
The PetStore: Agentic Workflow Lab Guide   
When you are now logged in, you should see the PLuG Launcher again, with your own  configured PLuG. You can open it and interact with it now to confirm. For example, ask it  again about the fun activities for dogs. 

If you later want to switch back to using the global config, go to the User Profile option in  the menu behind your initials (top right) and tick the box “Use global DevRev configuration”  again, save and relogin. 

**Important to know:** if you are not logged into the site, you will see PLuG and can interact  with it, but that will always be the default PetStore's org PLuG. Only when you are logged  in will the site inherit your own PLuG settings and workflows if you reconfigured those. 

3\. PetStore workflow scenarios

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 28**   
The PetStore: Agentic Workflow Lab Guide 

The PetStore has an extensive API Library which can be accessed via the API Docs link in  the menu at the top of the screen. This allows you to create a plethora of different  workflows and scenarios where our PLuG Agent can be of service. 

For example: 

● Ask questions about the pets that are available for adoption 

● Ask about the services on offer 

● Ask about the products on offer 

● Make an appointment for a service 

● Ask for help with an order (create support ticket) 

● Ask for help with tracking of an order. 

We are now going to build out these workflows and the accompanying Agent Prompt. But  feel free to experiment with workflows and APIs that we don’t cover in this lab. 

Writing a good prompt is paramount to the effectiveness of your agent. Prompt  Engineering is becoming the most popular programming language in the world at a rapid  pace, but it’s not always that easy. You need to be clear and concise and leave no room  for interpretation most of the time when it comes to corporate workflows. You want exact  answers to questions, and correct actions to be taken. 

First we will add basic functionality into the prompt, such as behavioural aspects and  general guide lines. We will do this by importing the pre-written agent prompt in  subsequent steps, and then add workflows as we need them. 

**3.1 Setting up basic prompts and skills.** 

3.1.1 Setting the basic prompt

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 29**   
The PetStore: Agentic Workflow Lab Guide 

➔ Open the file “CS Agent prompt part 1.rtf” from the Agent Prompts subfolder in the Petstore materials and copy its contents to the clipboard. 

➔ Login to your DevRev org and go to the Agent builder.  

➔ Select your CS Agent and click on the **Instructions** pane to put it in edit mode. ➔ Remove all existing content and paste in the contents of your clipboard. ➔ Click **Save Changes**. 

Here is the prompt you just pasted in, please read it to understand its function. 

**General behaviour:** 

You are an AI Customer Support Agent for DevRev PetStore — a store that helps customers adopt pets, book  veterinary appointments, buy pet focused products such as food and toys, and access exclusive content. Your job is  to offer helpful, friendly, and accurate support across a range of topics. You are trained on an extensive knowledge  base covering all products, services, store procedures, and pet information. 

**How to Handle Inquiries:** 

Always: 

● When you receive the first message in the conversation, search for the user's information. If it returns "User  not found", the user isn't logged in yet and user\_status is deemed "unregistered". If you do get information  back, the user\_status is "registered" and logged in and likely a return customer. Do not tell the user you are  doing this under any circumstances. For a registered user, always retrieve their API key. 

● You can provide information about the pets in the store and link to knowledge base articles for unregistered  users. When they want to proceed with adoption, or booking appointments etc, then ask them to login or  register an account if they haven't done so yet. You can tell them you can help them register an account if  they don't want to do it via the registration form. 

● Be friendly, empathetic, and professional. 

● Use a casual yet respectful tone; you're speaking to pet lovers and families. 

● Proactively offer to assist with related tasks (e.g., "Would you like me to help you book a vet appointment  for Fluffy?"). 

● If you can't answer a question, or the customer asks to be connected to a human agent, you can do so. ● When a conversation can be closed, because the customer has no more questions and their inquiry is  solved, you can set the conversation to resolved. 

● If you need to create a ticket, make sure you capture as much information as possible to augment the ticket. **What You Should Avoid** 

● Do not fabricate answers. If something is unclear or unavailable, suggest a human support handoff. ● Avoid making medical diagnoses. Direct users to book a vet appointment instead.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 30**   
The PetStore: Agentic Workflow Lab Guide 

● Do not answer questions or offer advice or opinions about subjects that are out of scope for the DevRev  PetStore 

**Examples of acceptable interactions with customers:** 

● Customer: “Can I adopt a puppy that’s good with small children?” You : “Absolutely\! I can help with that.  Based on your preference, we have a few sweet-natured puppies that are perfect for families with young  kids. Would you like to see some options?” 

● Customer : “Where’s my order?” You : “Let me check that for you. Can you please provide your order  number or email address?” 

**Website links:** the main PetStore site operates at https://petstore.devrev.community Any shortened or parts of  content links need to be preceded by this if you offer direct links to for example images. 

**Use the Knowledge Base to:** 

● Clarify adoption procedures, return policies, age/health/vaccination status of animals, and appointment  guidelines. 

● Share expert tips for new pet owners. 

In this first piece you can see we give the Agent a clear identity and purpose, as well as  guidelines on how to perform basic interactions. Just as you would teach a human agent  how to behave, you train your AI agent as well. 

3.1.2 Add supporting workflows 

In the prompt you also see there are a couple of actual tasks the agent needs to perform.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 31**   
The PetStore: Agentic Workflow Lab Guide 

For example, the PetStore website works with API keys to make sure that certain API calls  are executed in the context of the user in the conversation. That means we first have to  establish if the user is logged in and thus has an account with an API key. Which we will  then need to retrieve for use in further interactions. 

Also there are a couple of support related tasks defined, such as being able to create a  ticket if needed, or get a human agent involved in the conversation, as well as being able  to properly close the conversation. In this step we will add these specific workflows. 

| PRE-GA NOTE: |
| :---- |
| The route to manually create workflows, or edit them, is going to change when the  Agent builder gets to GA state. Currently you need to add the Workflows via the Agent  Builder, otherwise they won’t show up as selectable workflows. You can however import  “new” workflows via the normal route. They then become available to select and add to  an agent.  |

The first skill we will add manually: 

➔ Go to the **Agent Builder** 

➔ Click on the **Skills** window 

➔ Click on **\+ Add skill** 

➔ Click on **View All** next to the Workflows option 

➔ Click on **\+ Create New** 

➔ Click **Go to Workflow Builder**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 32**   
The PetStore: Agentic Workflow Lab Guide 

A template will now open on the canvas. The **Agent Skill Trigger** node is needed to  configure any schema customisation you might need, for example to fetch information  from a user, that you need to then put in an API payload. 

The Petstore website is set up so that when someone logs in, an API call is made to  DevRev to fetch a session token. This session token is then also passed to PLuG when it  initialises, allowing to match the logged in user from the PetStore to the user in  PLuG/DevRev.  

This userID is exposed as a system property to the agent, which we can fetch as a  variable. In this case we need to fetch the revuser ID from the agent session and with this  check via an user information API endpoint on the PetStore side (/api/admin/user) if that  revuser ID is linked to a PetStore User.  

If there is a PetStore user linked, then we can have the agent fetch the API key for that  user. 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 33**   
The PetStore: Agentic Workflow Lab Guide 

First we are going to edit the schema so we can use the revuser ID as a variable for our  HTTP call to the API endpoint. 

➔ Click on the **Agent Skill Trigger** node. 

➔ Click on **Add Input Parameters**, a side pane will open. 

➔ Click on **\+Add first field** 

➔ As field name enter “*UserID*” 

➔ As field type select “**ID**” out of the list of possible options. 

➔ As ID type, select “**Contact**” (which is what a revuser is). 

➔ In the description write “*The User\_ID of the user initiating the conversation*”. This  description is a mini-prompt for the AI to understand what the value is for. 

➔ Click **Save.** 

➔ Then close the open panes to return to the canvas. 

The next node we need to configure now is the HTTP node that's already provided for us.  HTTP nodes allow us to do API calls to any external system.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 34**   
The PetStore: Agentic Workflow Lab Guide 

➔ Click on the **HTTP node** to edit it. 

➔ Enter the url https://petstore.devrev.community/api/admin/user 

➔ Click **Save.** 

Since we need to be doing this as an authorised admin, we need to supply it with a bearer  token. The Petstore has been configured to also accept the Application Access Token. 

The demo environment allows this token to be passed via the headers, and the endpoints  are allowed to be used without specifying “bearer” so we leave the Auth Type for what it is. 

➔ Set the first **Key** field of the **Headers** to “*Authorization*”, and click **Save.** ➔ In the **Value** paste your **AAT** and click **Save**. 

➔ As a method choose “**GET**”. 

For the **Query Parameters**, we need to pass the revuser ID we grabbed earlier from the  conversation.  

➔ add the **Key** *devrev\_revuser\_id* (which is what the field is called where the  revuser\_id is stored in the PetStore database. 

In the **Value**, we need to enter a variable from the earlier Trigger node.  

➔ Click on **Insert variable** just below the input box. 

➔ Now select the **UserID** variable from the **Output** of the **Agent Skill Trigger** 

When selected it will show up in the Value input box as a grey marked block called Agent  Skill Trigger \> Output \> UserID

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 35**   
The PetStore: Agentic Workflow Lab Guide 

➔ Close the window to save and return to the canvas. 

The final thing we now need to do is to set the output of the API call so the agent knows if  it went ok or not. 

➔ Click on the **Set Skill Output** node.  

By default the output should already be set to the **Key** *body* and the **Value** *HTTP \>  Output \> Body.* 

➔ Confirm and close the window and return to the canvas. 

The final thing we now need to do is to give the Skill a proper name and description.  ➔ Click on the **pencil icon** next to the Publish button at the top right of the window. 

The name of the skill is not that important, unless you reference it directly from a prompt.  This isn’t needed though as the Workflow description you give it will be enough for the  Agent to figure out which skills to invoke. 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 36**   
The PetStore: Agentic Workflow Lab Guide 

➔ Enter “*GetUserInfo*” as the **skill name**, and set the **description** to “*Get the user's  information*”. 

➔ Close all the windows to return to the canvas and click **Publish**. 

➔ Click **Okay** 

The workflow now shows up in the list of workflows (your ID might differ). ➔ Select it to return to the **Agent Builder**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 37**   
The PetStore: Agentic Workflow Lab Guide   
**Great\!** You added your first workflow as a Skill for an AI Agent. 

To test this do the following: 

➔ Login to the Petstore again with your account. Make sure to logout first as the  session probably already expired.  

➔ Select the API Debug menu option in your user menu.  

This will open up a live incoming API call monitor that can show you exactly what is being  requested and responded with.If there are prior entries you can clear the page.  

➔ On a clean page, open up a new conversation in PLuG, and just say *Hi*. 

Besides the greeting from the AI Agent (notice that he recognized you), you should see a  request/response pair pop up for the **/api/admin/user** endpoint.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 38**   
The PetStore: Agentic Workflow Lab Guide   
Now that we have a skill that determines if there is a registered user talking to PLuG, we  can add the follower skill to actually fetch the API key. You could expand this particular  workflow to add error logic and extra HTTP nodes to do it all in one workflow, but for sake  of the exercise and simplicity we keep these separate for now. 

➔ Go back to the DevRev UI.  

This time we will import a ready made template to make things a bit faster. Go to the  Workflows option in the Settings menu. 

➔ Click **\+ Workflow** in the top right. 

➔ Select **Import Workflow, Start with a pre-configured workflow**. ➔ Select the Getapikey-template.json from the Workflows subfolder in the  PetStore materials and import it.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 39**   
The PetStore: Agentic Workflow Lab Guide 

You will then see the workflow on the canvas. We need to make one little change,  because you need to provide your **Admin API key (AAT).** 

➔ Click on the **HTTP node** to edit it.  

Notice this workflow talks to a different endpoint. 

➔ In the first **Value** field under **Headers** paste in your **AAT** and **Save**. ➔ Leave the editor and return to the canvas.  

➔ Click **Deploy**. 

➔ Go back to the Agent Builder, and **Add** a new skill.  

You should now see the new *GetApiKey* workflow be available in the list. ➔ Click on it to attach it to the Agent. 

We now have both skills attached. 

Because the Prompt already talked about fetching the API key, we can immediately see if  the ability of the Agent has expanded. 

➔ Go back to PLuG on the PetStore site.  

➔ Clear the API Debugger. 

➔ Open a new chat in PLuG and type something to initiate a conversation.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 40**   
The PetStore: Agentic Workflow Lab Guide 

The debugger should now show two API calls following each other and it should have  fetched the API key too. 

This API key is now added to the memory of the agent, and every subsequent skill that  requires an API key will now allow the AI agent to automatically provide it.  

This shows how extremely powerful AI Agents are when equipped with a solid prompt and  skills. Without writing a single line of code, you automated a complex process, just by  simply explaining it to the agent in plain English, and drawing out the skills needed in a  graphical no-code environment\!

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 41**   
The PetStore: Agentic Workflow Lab Guide 

3.1.3 Add Ticket handling skills 

Now we are going to add the Ticket handling related skills. 

For this we can import 3 workflow templates, AssignConvo-template.json,  ResolveConvo-template.json and CreateTicket-template.json. 

Using the Workflow and Agent Builder, import these three workflows, like you did before in  the previous exercise. 

The end result should be as in the screenshot above. 

Let’s examine these workflows now. 

➔ Via the Agent Builder, click the 3 dots in the **Action** column besides the  **CreateTicket** skill and choose **edit workflow**. 

➔ In the next screen click **View Workflow** to open it on the canvas. ➔ Click **Edit workflow** and create a new version. (We aren’t going to edit anything,  but this allows more detailed viewing) 

➔ Click on the **Agent Skill Trigger** node to open it. 

➔ Examine the Input Parameters that are being collected. 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 42**   
The PetStore: Agentic Workflow Lab Guide 

You can see we want to collect a **TicketTitle** , a **TicketDescription**, as well as the  **Conversation ID**. Inside these fields, you can see the mini-prompts that ensure the  Agent knows what to put into those values, based on the intent of the user. 

➔ Close the **Agent Skill Trigger node.** 

➔ Open the **Suggest Part** node. 

This node determines which **Part** in the **Trails** is the best one to assign the ticket to. You  can hardcode it, but if you have a well laid out product trail this node is very handy to use.  Its input is the **ConversationID**, and it will output a **Part ID** which we can use in a follow  up node. 

➔ Close the **Suggest Part** node 

➔ Open the **Create Ticket** node 

Here you see that we inherit variables from two previous nodes, the **TicketTitle** and  **TicketDescription** from the **Agent Skill Trigger node**, and the **ID** for the **Part** from the  **Suggest Part node**.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 43**   
The PetStore: Agentic Workflow Lab Guide 

We currently don’t assign the ticket, which is why the **Owned By field** is unconfigured. 

You can force a ticket assignment or other variables if you want, such as the **Severity** or  the **Stage** of a ticket. Feel free to experiment with these options by adding additional  attributes. 

➔ Close the **Create Ticket node**. 

➔ Open the **Link Conversation with Ticket node**. 

This node does a simple thing, and links the **ConversationID** to the **TicketID**, again  based on outputs of previous node actions. 

➔ Close the **Link Conversation with Ticket node**. 

➔ Open the **Set Skill Output node**. 

Here you see we return the **Output** of the **Create Ticket node** back to the Agent, so that  it knows the **TicketID** and communicates it back to the user.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 44**   
The PetStore: Agentic Workflow Lab Guide 

3.1.4 Adjusting the assignee 

➔ Open the **AssignConvo** skill now and edit it. 

➔ Click on the **Update Conversation node**. 

Since we imported this workflow we need to select the proper “**Owned By**” user account  first.  

➔ Edit the field and select **your own devuser account** (should be at the top of the  list). 

➔ Close the window and **Publish** the workflow.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 45**   
The PetStore: Agentic Workflow Lab Guide 

3.1.5 Testing conversation hand-off 

➔ Log back in to the PetStore and open a PLuG conversation. 

First we want to test if we can hand off a conversation to a human agent. ➔ Ask PLuG to speak to a human agent. 

It should confirm your request and you should see the username change at the top of the  window to the user you selected. 

This conversation is now handed over to a human and the Agent will no longer respond.  The user who the conversation is assigned to, will be notified in DevRev: 

You can now take over the conversation and resolve the user’s inquiry. Setting the  conversation to Resolved will close the conversation in PLuG as well.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 46**   
The PetStore: Agentic Workflow Lab Guide 

3.1.6 Testing Ticket creation. 

➔ Open a new conversation. 

➔ Tell the agent you have an issue with a product, and want to open a ticket.The  agent will now ask you for more information. 

➔ Provide it with some details, for example “The dog food purchased was already  past its expiry date”. 

The agent should now create a ticket for you. You will also see a new tab appear at the  top of the conversation window with Tickets. 

You can inspect the ticket details and progress there. Users can also be emailed with their  ticket details once opened. 

Now let’s see if the agent can also close conversations by itself. 

➔ Tell it “*Thank you, no further questions.*” 

Perfect, the workflows all work as intended\!

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 47**   
The PetStore: Agentic Workflow Lab Guide 

3.1.7 Extending interactions with Snap-Ins 

We are going to extend the functionality of conversation closure by capturing the CSAT  score automatically . We do this by installing a Snap-In. 

➔ Go to the Snap-Ins menu option in the Settings. 

➔ Search for “CSAT” and then select the CSAT on Conversation snap-in. 

➔ In the snap-in’s detail page, click on **Add** in the top right corner of the window. ➔ The configuration pane will now open. Leave everything default and click on **Install  Snap-in**. 

➔ Go back to the PetStore website. 

➔ Start a new conversation about any topic you choose, and then indicate the matter  is resolved.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 48**   
The PetStore: Agentic Workflow Lab Guide 

You should now see the CSAT score capture pane show up in the conversation window  and the value returned in the Conversation within DevRev. 

CSAT scores can be pulled into dashboards, allowing you to easily find trends and  relationships with, for example, other events such as software releases or SLA breaches.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 49**   
The PetStore: Agentic Workflow Lab Guide 

**3.2 Extending the Agents responsibilities** 

Let’s now expand on the prompt and give the agent more backend tools that are specific  to the PetStore. 

We are going to now add the ability for the Agent to work with the available pets in the  store, which are exposed through the /api/pets endpoint. 

3.2.1 Expanding the prompt 

➔ Open the “CS Agent Prompt part 2.rtf” file and copy/paste its contents  below the existing prompt in the Agent builder. 

This part talks about procedures: 

**Procedures:** 

**1\. Pet Information Lookup** 

· Provide background details, health records, breed info, and care tips about pets listed for  adoption.  

· Recommend pets based on customer needs e.g., good with kids, hypoallergenic, low maintenance, etc.. Use common sense, and always explain your reasoning for a particular  choice. 

➔ When you add the prompt extension, save the changes.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 50**   
The PetStore: Agentic Workflow Lab Guide 

3.2.2 Add new skills 

➔ Create a new skill for the Agent by importing the GetAllPets-template.json from the Workflows subfolder in the PetStore Materials folder 

If you want you can inspect the workflow’s functionality. 

➔ Deploy the workflow and add it to the skills list of the Agent. 

➔ Now open a new conversation with the Agent. 

➔ Ask it what cats it has available for adoption. 

The agent will now retrieve the inventory of animals and filter out a response showing all  the cats that are available. 

You can experiment further by asking more detailed questions.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 51**   
The PetStore: Agentic Workflow Lab Guide 

3.2.3 Analyzing Workflow Runs 

Lets investigate what happened behind the scenes by using the Workflow Runs option. 

➔ Go back to the DevRev Agent Builder 

➔ Open up the **GetAllPets** skill onto the canvas. 

➔ At the top left, click on the **Runs** button. 

You should now be seeing a list of completed runs with at least one entry since we just  tested the workflow. 

➔ Click on the most recent run in your list. 

This will take us back to a canvas with status indicators. 

You can now click on any of the nodes to option up debug information which shows you  the time it took for each step to complete and also all the in and output information, keys,  values etc that were passed on down the workflow.  

Examine each node and expand all the keys to get an understanding of the flow of  information. 

This is an invaluable tool to troubleshoot any issues you might experience when building  workflows.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 52**   
The PetStore: Agentic Workflow Lab Guide 

**3.3 Setting up an advanced procedure and workflows** 

The next workflow we will set up is made up of a complex procedure and several skills that  allow the Agent to fully manage appointment bookings for customers. Instead of having to  go through a form and having to collect information, a customer can simply chat to the  agent, who then fully understands the customer's intent, and special needs and makes  smart decisions based on extended knowledge in the Knowledge Graph. 

This setup consists of three parts: 

● The prompt 

● The skills 

● The knowledgebase articles. 

3.3.1 Adding the workflow descriptions to the prompt. 

➔ Open up the “CS Agent Prompt part 3.rtf” and add its contents to the  existing prompt. Make sure to save. 

The prompt consist of the following instructions: 

**2\. Vet Appointment Booking** 

· Guide customers through booking or rescheduling appointments with vets or groomers. Make  sure they provide you with their pet's name, what kind of animal it is, and any important  details to know about the animal (be very strict about this, do not book an appointment  without at least gathering these three things) 

· Appointment booking is very time and date sensitive. Always double check your own  timestamp in relation to the request made, and don't accidentally add or subtract days. 

· Not all personnel are available on every day of the week. Make sure you always check for  availability correctly. 

· If no specific dates are mentioned or requested but the type of service and additional context  about the animal is known, (for example "next week" and "dangerous cat")you should first  determine the best vet for the job and then look for available dates and slots second based on  the availability of the vet or groomer.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 53**   
The PetStore: Agentic Workflow Lab Guide 

· To make sure you give the customer the best available vet or groomer, you need to carefully  check for more in depth information about the staff in the knowledge base articles available  to you. Make sure to properly cross reference the different specialisations, skills and  expertises of the staff mentioned in that article and always select the most suited person  which should be the one that has the most relevance to the customers request and context.  Expertise should always be taken as the most important property. 

· When you find the best solution for the customer, present the option and ask if you should  book it for them. Only offer 3 or 4 slots in total, don't show the whole list. Once confirmed,  make the booking. 

· Answer questions about the services provided during appointments. Use the Knowledgebase  articles provided to you. 

3.3.2 Importing the workflows 

The next step is to add all the different workflows needed. Depending on how you ask the  agent to book an appointment, different skills will be invoked, and could be invoked in  different combinations or order. 

➔ Import the following list of workflows. Deploy them all and add them to the Agent  like you did before: 

Getavailablestaff-template.json  

Getallstaff-template.json 

Getavailableslots-template.json 

Getallservices-template.json 

Bookappointment-template.json 

Getappointments-template.json

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 54**   
The PetStore: Agentic Workflow Lab Guide 

3.3.3 Adding articles to the Knowledge Base 

We now also need to augment the Knowledge base with background information on the  staff’s expertise, and what services are offered, to help the AI make the right decisions,  based on factual information. 

➔ Go to the Knowledge base option in the Settings menu. 

➔ Create a new article 

➔ For the first article, provide the Title “*PetStore Services Overview*”, and a description  of “*Overview and detailed descriptions of all offered services at PetStore*” ➔ As Part, select any part (doesn’t really matter for now),  

➔ Set yourself as the owner 

➔ make it visible to Customers.  

➔ Then choose the option Create Page, and paste in the contents of the “PetStore  Services Overview.rtf” document from the Articles subfolder in the  PetStore Materials folder. 

➔ Publish the article. 

➔ Then create another article called “*PetStore Staff Overview*”, with a description of  “*List of vets, groomers and support staff and their expertise, availability and  backgrounds*.” 

➔ Set everything the same as the previous article, and paste in the contents of the  “PetStore Staff Overview.rtf” file. 

➔ Publish the article.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 55** 

3.3.4 Testing the workflows.   
The PetStore: Agentic Workflow Lab Guide 

➔ Log in to the PetStore again and go to the **API Debug** page.  

➔ Clear the history. 

➔ Open a new PLuG chat and enter a message similar to this: 

“*Hi, I want to make an appointment for my cat Fluffy. He needs to be vaccinated,  but he’s very easily scared. What options do you have for me?*” 

You should now see a whole stream of API calls incoming, that first determine the  user’s API key, then does a lookup for which vets are available, and which  timeslots.  

Together with the API outputs, it has also taken into consideration the information  on the different staff that work at the PetStore, to accommodate for the fact we’re  dealing with an easily frightened kitten. It determined the right vet to choose, and  then looked for the best available day.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 56**   
The PetStore: Agentic Workflow Lab Guide 

➔ Choose any of the slots to continue, or tell the Agent to choose.  

➔ The agent will then complete the booking via a Post request.  

➔ Open the details and examine the request and response payloads. 

● Finally ask the agent to show your appointments.  

Another API call to read the appointments will be executed.  

➔ You can verify the appointment by going to the **Appointments page**, or click on  **My Appointments** in your user menu.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 57**   
The PetStore: Agentic Workflow Lab Guide 

Excellent\! We now have a fully capable booking assistant that can fulfill all our customer’s  needs and wishes, fully automatically.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 58**   
The PetStore: Agentic Workflow Lab Guide 

**3.4 Adding extra utility skills.** 

For this exercise we will add some convenience skills, like being able to inquire about order  status and tracking information. Optionally you can also add the prompt \+ skill to register  accounts via PLuG. 

3.4.1 Order Status and Tracking info workflows. 

This exercise is unguided on purpose. By now you should have a firm understanding of  how the Agent Builder and Workflow engine works. 

➔ Add/create the remaining prompt (CS Agent Prompt part 4) and workflows  **GetOrderStatus-template.json** and **GetTrackingInfo** 

**template.json** and test them.  

➔ You do need to place an order first in the shop (fictional credit cards provided in the  gui). Choose any type and amount of products you prefer.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 59**   
The PetStore: Agentic Workflow Lab Guide 

**3.5 Adding a password reset function.** 

For this final exercise, you need to use the API Docs of the website to build a password reset  function in PLuG. 

You need to build everything from scratch now, the prompt that describes the process, as well as  the workflow that invokes the API call on the PetStore site.  

A good place to start is the API Docs page.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Confidential 60** 

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAATCAYAAABvLghXAAAEsklEQVR4Xu2YV4hlRRCGywyKitkHxzWCgogYEBR3xjVgAB9E1EXQdWXBiBEREbNiQnFFxYS4YEZczCLKGFYUc/ZFWAVFRcGcU323/5ru02fuudeHufsyP3zMnO7qPn26uqu6r1nSIeID5w9nmdjVWeJ81sGN1l/rW+675CCxnbPSlPVoxPvq8ZTMc9YWI9G486f4t+I7Z6Hzj6jrKcNJ/bSXtdvU7XH6fmIUWt35W9TjCb4Xx6jNjGrcZh1QM1IHPGHtAZRcbTkk1XVPWrfCAb8K7GFS4GDqYwEQAmZatQMmLY8LWBCx4P5ydum1mkEtt+akvuLcVXCG5ZgduyAGyAR3KRzwuai1lqV3xLu/dNZsWCSNiQlnR2dlEYrnfvmEcsCmdsCcwg5h85SgfnGzutfPDmJva7eP93SNp1HPhJcOODHbtfSG5VUDgzTIAYgJWS6wPaqoI4k/bM0Jw/Efi92cnSwdHOAbS/2V2sD5RfzmbGHdDkAsOqB+aVG+s/OeNUMyfx8XvIt2MZ6ybehQy/VvU7DImh12OYDG2O0rBmkYB6DrBbY3O6uICHs4Hs53HrI8XiZ8U+cjgS07tdSxKo+FM2gHoPsF9bdYsoFvLb2XMQDjeV128Jzson+cvo41dbdl+/MomHVAWyN1AHHoGkHS6XIAtnfUhR0a1gGnCmwfcw4XPL/lrCFCNwnqL3EuFDzfPmWVRH/xwcdb2wH3OLcWPGPZwTBR1GF/gzXFuAhLQP2485Lg+chs2rPl4BF9b0vh1voHJix1EM8whpG0iTPX2VAM0rAOOElgy0lkieD5Iktxu+QwQf2rzvaCj/raWVWw+jh9RczdyNoOmI44lZ1rSV8I6va39niuE9Rf6pwseH7Asg5W2WuiJ7ZSPYCSi50LBB9BGckMzrRuDesABg3YMvHPi3os0/GVZbFbKJsQR+g5TjWodgDfRSgDHPios6VArNpBDishxBAWASf+aHkH3yabs0RPZPZ+L+AycoI1c0QJZQdYfw3rAE5icRo7zXla8PyCc2cHhKLQOZbaXC4IlzwvEKh2wBxLYQL4np8s/UQCiFz0u8Ce3FCPoYSVHyKc0Wae+NRSmN9c9DTrgBXsAESiKpNVcKXliejHg9ZfwzhgkWUH85GbWXov0PaqbDqljQV3gG2KcsIGE/uy+MRSDlhXoOkcELpXZRGjV1N5nMKoIwfUIo8C4yFPho6z1IawBHzji0X9lPYQscp/FnT2rsoCksrRBQdaf4UDyPwQFxyOX0BcLncWJxoUSZWcw4rcRyDG9KagDTmqFBMfE0zfXORKdTmAix8LJcZzmcqJAkDZ+5aTL9rd+UHwvrkqR/RHrmTVA+05bPTVs5aMFgt0n8oCtvmwCgd0QaK6QnA9L0WSj90BnHAiFABncH7OKBXH2YBEXKrLAYh7RNQztj0t30sesTxm4AAQjob6iIpI6uW3ljukJeIUHhsTiF87yxj4fxywlWVnllwrTrF82ugntjxXeuCHsmWWjodQTz7i9BHv4XJX2zCRcfHDZr1mdU+MC6g/vSjnaMtOmBQfWtrF88V0Grc8nrOrupZmHZC0whyAFtYFliYB3rEhO5nVcPoPoabMsl4qiYMAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAB0UlEQVR4Xs3WvSuFURwH8J8MZJAoeSmTohAZvJTFwqREMlgpo9XLZDAZKZNISUxeisGGweJtIP+AEhYi7/y+z/md+zzP7557e1x58q3PwO+c87v3Puece4nCaWCr7Ja9iQs2wfJEF7v8oRWS9Itn9uXwyU5EOTt3jHHBPOgkSSyNqtiT0ANdk7ZYT+BvPS5oV3iZdQxI54PVs32h69Y7axJejhyDwL5ilyHWJtBYz4U1Uomt0ZkUdJM+UeSQ68002aDk+S9knn0oi5Q8EI2wUxLbMk3qyJy34Ny50AhJM5kHB5k0QhbIn/vAykJVSWyNkFGBBpk0qmCPYkrVnMFBPCWzkzpE1NgXW6ALNtkOpSxf6BpkeTP9YBdWimJVS0Qv8meNdsh8VFFh03STuVxhicw9GTzQOJu9pNJIybsunQNWza6ErltoOCYSWRZ6cJB9R+3s0FF3sW+glSSxNbIPMtUXH6yLFvLPW1R4jqHMkHuRV1YjhlOMwUUKNw57pFLC7im8ABadD4wZlP/pRtsiUmJrhExSeCHcX7jLbGrJbIpfN8JtcE3+4ZsOl71skl/PuBEywu5EoaohuGaOhW32vxvlsAGRKvYn8jiZn834OMGZb/fThMYqY/wCAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAATCAYAAABvLghXAAAEsklEQVR4Xu2YV4hlRRCGywyKitkHxzWCgogYEBR3xjVgAB9E1EXQdWXBiBEREbNiQnFFxYS4YEZczCLKGFYUc/ZFWAVFRcGcU323/5ru02fuudeHufsyP3zMnO7qPn26uqu6r1nSIeID5w9nmdjVWeJ81sGN1l/rW+675CCxnbPSlPVoxPvq8ZTMc9YWI9G486f4t+I7Z6Hzj6jrKcNJ/bSXtdvU7XH6fmIUWt35W9TjCb4Xx6jNjGrcZh1QM1IHPGHtAZRcbTkk1XVPWrfCAb8K7GFS4GDqYwEQAmZatQMmLY8LWBCx4P5ydum1mkEtt+akvuLcVXCG5ZgduyAGyAR3KRzwuai1lqV3xLu/dNZsWCSNiQlnR2dlEYrnfvmEcsCmdsCcwg5h85SgfnGzutfPDmJva7eP93SNp1HPhJcOODHbtfSG5VUDgzTIAYgJWS6wPaqoI4k/bM0Jw/Efi92cnSwdHOAbS/2V2sD5RfzmbGHdDkAsOqB+aVG+s/OeNUMyfx8XvIt2MZ6ybehQy/VvU7DImh12OYDG2O0rBmkYB6DrBbY3O6uICHs4Hs53HrI8XiZ8U+cjgS07tdSxKo+FM2gHoPsF9bdYsoFvLb2XMQDjeV128Jzson+cvo41dbdl+/MomHVAWyN1AHHoGkHS6XIAtnfUhR0a1gGnCmwfcw4XPL/lrCFCNwnqL3EuFDzfPmWVRH/xwcdb2wH3OLcWPGPZwTBR1GF/gzXFuAhLQP2485Lg+chs2rPl4BF9b0vh1voHJix1EM8whpG0iTPX2VAM0rAOOElgy0lkieD5Iktxu+QwQf2rzvaCj/raWVWw+jh9RczdyNoOmI44lZ1rSV8I6va39niuE9Rf6pwseH7Asg5W2WuiJ7ZSPYCSi50LBB9BGckMzrRuDesABg3YMvHPi3os0/GVZbFbKJsQR+g5TjWodgDfRSgDHPios6VArNpBDishxBAWASf+aHkH3yabs0RPZPZ+L+AycoI1c0QJZQdYfw3rAE5icRo7zXla8PyCc2cHhKLQOZbaXC4IlzwvEKh2wBxLYQL4np8s/UQCiFz0u8Ce3FCPoYSVHyKc0Wae+NRSmN9c9DTrgBXsAESiKpNVcKXliejHg9ZfwzhgkWUH85GbWXov0PaqbDqljQV3gG2KcsIGE/uy+MRSDlhXoOkcELpXZRGjV1N5nMKoIwfUIo8C4yFPho6z1IawBHzji0X9lPYQscp/FnT2rsoCksrRBQdaf4UDyPwQFxyOX0BcLncWJxoUSZWcw4rcRyDG9KagDTmqFBMfE0zfXORKdTmAix8LJcZzmcqJAkDZ+5aTL9rd+UHwvrkqR/RHrmTVA+05bPTVs5aMFgt0n8oCtvmwCgd0QaK6QnA9L0WSj90BnHAiFABncH7OKBXH2YBEXKrLAYh7RNQztj0t30sesTxm4AAQjob6iIpI6uW3ljukJeIUHhsTiF87yxj4fxywlWVnllwrTrF82ugntjxXeuCHsmWWjodQTz7i9BHv4XJX2zCRcfHDZr1mdU+MC6g/vSjnaMtOmBQfWtrF88V0Grc8nrOrupZmHZC0whyAFtYFliYB3rEhO5nVcPoPoabMsl4qiYMAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAB0UlEQVR4Xs3WvSuFURwH8J8MZJAoeSmTohAZvJTFwqREMlgpo9XLZDAZKZNISUxeisGGweJtIP+AEhYi7/y+z/md+zzP7557e1x58q3PwO+c87v3Puece4nCaWCr7Ja9iQs2wfJEF7v8oRWS9Itn9uXwyU5EOTt3jHHBPOgkSSyNqtiT0ANdk7ZYT+BvPS5oV3iZdQxI54PVs32h69Y7axJejhyDwL5ilyHWJtBYz4U1Uomt0ZkUdJM+UeSQ68002aDk+S9knn0oi5Q8EI2wUxLbMk3qyJy34Ny50AhJM5kHB5k0QhbIn/vAykJVSWyNkFGBBpk0qmCPYkrVnMFBPCWzkzpE1NgXW6ALNtkOpSxf6BpkeTP9YBdWimJVS0Qv8meNdsh8VFFh03STuVxhicw9GTzQOJu9pNJIybsunQNWza6ErltoOCYSWRZ6cJB9R+3s0FF3sW+glSSxNbIPMtUXH6yLFvLPW1R4jqHMkHuRV1YjhlOMwUUKNw57pFLC7im8ABadD4wZlP/pRtsiUmJrhExSeCHcX7jLbGrJbIpfN8JtcE3+4ZsOl71skl/PuBEywu5EoaohuGaOhW32vxvlsAGRKvYn8jiZn834OMGZb/fThMYqY/wCAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAATCAYAAABvLghXAAAEsklEQVR4Xu2YV4hlRRCGywyKitkHxzWCgogYEBR3xjVgAB9E1EXQdWXBiBEREbNiQnFFxYS4YEZczCLKGFYUc/ZFWAVFRcGcU323/5ru02fuudeHufsyP3zMnO7qPn26uqu6r1nSIeID5w9nmdjVWeJ81sGN1l/rW+675CCxnbPSlPVoxPvq8ZTMc9YWI9G486f4t+I7Z6Hzj6jrKcNJ/bSXtdvU7XH6fmIUWt35W9TjCb4Xx6jNjGrcZh1QM1IHPGHtAZRcbTkk1XVPWrfCAb8K7GFS4GDqYwEQAmZatQMmLY8LWBCx4P5ydum1mkEtt+akvuLcVXCG5ZgduyAGyAR3KRzwuai1lqV3xLu/dNZsWCSNiQlnR2dlEYrnfvmEcsCmdsCcwg5h85SgfnGzutfPDmJva7eP93SNp1HPhJcOODHbtfSG5VUDgzTIAYgJWS6wPaqoI4k/bM0Jw/Efi92cnSwdHOAbS/2V2sD5RfzmbGHdDkAsOqB+aVG+s/OeNUMyfx8XvIt2MZ6ybehQy/VvU7DImh12OYDG2O0rBmkYB6DrBbY3O6uICHs4Hs53HrI8XiZ8U+cjgS07tdSxKo+FM2gHoPsF9bdYsoFvLb2XMQDjeV128Jzson+cvo41dbdl+/MomHVAWyN1AHHoGkHS6XIAtnfUhR0a1gGnCmwfcw4XPL/lrCFCNwnqL3EuFDzfPmWVRH/xwcdb2wH3OLcWPGPZwTBR1GF/gzXFuAhLQP2485Lg+chs2rPl4BF9b0vh1voHJix1EM8whpG0iTPX2VAM0rAOOElgy0lkieD5Iktxu+QwQf2rzvaCj/raWVWw+jh9RczdyNoOmI44lZ1rSV8I6va39niuE9Rf6pwseH7Asg5W2WuiJ7ZSPYCSi50LBB9BGckMzrRuDesABg3YMvHPi3os0/GVZbFbKJsQR+g5TjWodgDfRSgDHPios6VArNpBDishxBAWASf+aHkH3yabs0RPZPZ+L+AycoI1c0QJZQdYfw3rAE5icRo7zXla8PyCc2cHhKLQOZbaXC4IlzwvEKh2wBxLYQL4np8s/UQCiFz0u8Ce3FCPoYSVHyKc0Wae+NRSmN9c9DTrgBXsAESiKpNVcKXliejHg9ZfwzhgkWUH85GbWXov0PaqbDqljQV3gG2KcsIGE/uy+MRSDlhXoOkcELpXZRGjV1N5nMKoIwfUIo8C4yFPho6z1IawBHzji0X9lPYQscp/FnT2rsoCksrRBQdaf4UDyPwQFxyOX0BcLncWJxoUSZWcw4rcRyDG9KagDTmqFBMfE0zfXORKdTmAix8LJcZzmcqJAkDZ+5aTL9rd+UHwvrkqR/RHrmTVA+05bPTVs5aMFgt0n8oCtvmwCgd0QaK6QnA9L0WSj90BnHAiFABncH7OKBXH2YBEXKrLAYh7RNQztj0t30sesTxm4AAQjob6iIpI6uW3ljukJeIUHhsTiF87yxj4fxywlWVnllwrTrF82ugntjxXeuCHsmWWjodQTz7i9BHv4XJX2zCRcfHDZr1mdU+MC6g/vSjnaMtOmBQfWtrF88V0Grc8nrOrupZmHZC0whyAFtYFliYB3rEhO5nVcPoPoabMsl4qiYMAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAB0UlEQVR4Xs3WvSuFURwH8J8MZJAoeSmTohAZvJTFwqREMlgpo9XLZDAZKZNISUxeisGGweJtIP+AEhYi7/y+z/md+zzP7557e1x58q3PwO+c87v3Puece4nCaWCr7Ja9iQs2wfJEF7v8oRWS9Itn9uXwyU5EOTt3jHHBPOgkSSyNqtiT0ANdk7ZYT+BvPS5oV3iZdQxI54PVs32h69Y7axJejhyDwL5ilyHWJtBYz4U1Uomt0ZkUdJM+UeSQ68002aDk+S9knn0oi5Q8EI2wUxLbMk3qyJy34Ny50AhJM5kHB5k0QhbIn/vAykJVSWyNkFGBBpk0qmCPYkrVnMFBPCWzkzpE1NgXW6ALNtkOpSxf6BpkeTP9YBdWimJVS0Qv8meNdsh8VFFh03STuVxhicw9GTzQOJu9pNJIybsunQNWza6ErltoOCYSWRZ6cJB9R+3s0FF3sW+glSSxNbIPMtUXH6yLFvLPW1R4jqHMkHuRV1YjhlOMwUUKNw57pFLC7im8ABadD4wZlP/pRtsiUmJrhExSeCHcX7jLbGrJbIpfN8JtcE3+4ZsOl71skl/PuBEywu5EoaohuGaOhW32vxvlsAGRKvYn8jiZn834OMGZb/fThMYqY/wCAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAATCAYAAABvLghXAAAEsklEQVR4Xu2YV4hlRRCGywyKitkHxzWCgogYEBR3xjVgAB9E1EXQdWXBiBEREbNiQnFFxYS4YEZczCLKGFYUc/ZFWAVFRcGcU323/5ru02fuudeHufsyP3zMnO7qPn26uqu6r1nSIeID5w9nmdjVWeJ81sGN1l/rW+675CCxnbPSlPVoxPvq8ZTMc9YWI9G486f4t+I7Z6Hzj6jrKcNJ/bSXtdvU7XH6fmIUWt35W9TjCb4Xx6jNjGrcZh1QM1IHPGHtAZRcbTkk1XVPWrfCAb8K7GFS4GDqYwEQAmZatQMmLY8LWBCx4P5ydum1mkEtt+akvuLcVXCG5ZgduyAGyAR3KRzwuai1lqV3xLu/dNZsWCSNiQlnR2dlEYrnfvmEcsCmdsCcwg5h85SgfnGzutfPDmJva7eP93SNp1HPhJcOODHbtfSG5VUDgzTIAYgJWS6wPaqoI4k/bM0Jw/Efi92cnSwdHOAbS/2V2sD5RfzmbGHdDkAsOqB+aVG+s/OeNUMyfx8XvIt2MZ6ybehQy/VvU7DImh12OYDG2O0rBmkYB6DrBbY3O6uICHs4Hs53HrI8XiZ8U+cjgS07tdSxKo+FM2gHoPsF9bdYsoFvLb2XMQDjeV128Jzson+cvo41dbdl+/MomHVAWyN1AHHoGkHS6XIAtnfUhR0a1gGnCmwfcw4XPL/lrCFCNwnqL3EuFDzfPmWVRH/xwcdb2wH3OLcWPGPZwTBR1GF/gzXFuAhLQP2485Lg+chs2rPl4BF9b0vh1voHJix1EM8whpG0iTPX2VAM0rAOOElgy0lkieD5Iktxu+QwQf2rzvaCj/raWVWw+jh9RczdyNoOmI44lZ1rSV8I6va39niuE9Rf6pwseH7Asg5W2WuiJ7ZSPYCSi50LBB9BGckMzrRuDesABg3YMvHPi3os0/GVZbFbKJsQR+g5TjWodgDfRSgDHPios6VArNpBDishxBAWASf+aHkH3yabs0RPZPZ+L+AycoI1c0QJZQdYfw3rAE5icRo7zXla8PyCc2cHhKLQOZbaXC4IlzwvEKh2wBxLYQL4np8s/UQCiFz0u8Ce3FCPoYSVHyKc0Wae+NRSmN9c9DTrgBXsAESiKpNVcKXliejHg9ZfwzhgkWUH85GbWXov0PaqbDqljQV3gG2KcsIGE/uy+MRSDlhXoOkcELpXZRGjV1N5nMKoIwfUIo8C4yFPho6z1IawBHzji0X9lPYQscp/FnT2rsoCksrRBQdaf4UDyPwQFxyOX0BcLncWJxoUSZWcw4rcRyDG9KagDTmqFBMfE0zfXORKdTmAix8LJcZzmcqJAkDZ+5aTL9rd+UHwvrkqR/RHrmTVA+05bPTVs5aMFgt0n8oCtvmwCgd0QaK6QnA9L0WSj90BnHAiFABncH7OKBXH2YBEXKrLAYh7RNQztj0t30sesTxm4AAQjob6iIpI6uW3ljukJeIUHhsTiF87yxj4fxywlWVnllwrTrF82ugntjxXeuCHsmWWjodQTz7i9BHv4XJX2zCRcfHDZr1mdU+MC6g/vSjnaMtOmBQfWtrF88V0Grc8nrOrupZmHZC0whyAFtYFliYB3rEhO5nVcPoPoabMsl4qiYMAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,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>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAB0UlEQVR4Xs3WvSuFURwH8J8MZJAoeSmTohAZvJTFwqREMlgpo9XLZDAZKZNISUxeisGGweJtIP+AEhYi7/y+z/md+zzP7557e1x58q3PwO+c87v3Puece4nCaWCr7Ja9iQs2wfJEF7v8oRWS9Itn9uXwyU5EOTt3jHHBPOgkSSyNqtiT0ANdk7ZYT+BvPS5oV3iZdQxI54PVs32h69Y7axJejhyDwL5ilyHWJtBYz4U1Uomt0ZkUdJM+UeSQ68002aDk+S9knn0oi5Q8EI2wUxLbMk3qyJy34Ny50AhJM5kHB5k0QhbIn/vAykJVSWyNkFGBBpk0qmCPYkrVnMFBPCWzkzpE1NgXW6ALNtkOpSxf6BpkeTP9YBdWimJVS0Qv8meNdsh8VFFh03STuVxhicw9GTzQOJu9pNJIybsunQNWza6ErltoOCYSWRZ6cJB9R+3s0FF3sW+glSSxNbIPMtUXH6yLFvLPW1R4jqHMkHuRV1YjhlOMwUUKNw57pFLC7im8ABadD4wZlP/pRtsiUmJrhExSeCHcX7jLbGrJbIpfN8JtcE3+4ZsOl71skl/PuBEywu5EoaohuGaOhW32vxvlsAGRKvYn8jiZn834OMGZb/fThMYqY/wCAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAATCAYAAABvLghXAAAEsklEQVR4Xu2YV4hlRRCGywyKitkHxzWCgogYEBR3xjVgAB9E1EXQdWXBiBEREbNiQnFFxYS4YEZczCLKGFYUc/ZFWAVFRcGcU323/5ru02fuudeHufsyP3zMnO7qPn26uqu6r1nSIeID5w9nmdjVWeJ81sGN1l/rW+675CCxnbPSlPVoxPvq8ZTMc9YWI9G486f4t+I7Z6Hzj6jrKcNJ/bSXtdvU7XH6fmIUWt35W9TjCb4Xx6jNjGrcZh1QM1IHPGHtAZRcbTkk1XVPWrfCAb8K7GFS4GDqYwEQAmZatQMmLY8LWBCx4P5ydum1mkEtt+akvuLcVXCG5ZgduyAGyAR3KRzwuai1lqV3xLu/dNZsWCSNiQlnR2dlEYrnfvmEcsCmdsCcwg5h85SgfnGzutfPDmJva7eP93SNp1HPhJcOODHbtfSG5VUDgzTIAYgJWS6wPaqoI4k/bM0Jw/Efi92cnSwdHOAbS/2V2sD5RfzmbGHdDkAsOqB+aVG+s/OeNUMyfx8XvIt2MZ6ybehQy/VvU7DImh12OYDG2O0rBmkYB6DrBbY3O6uICHs4Hs53HrI8XiZ8U+cjgS07tdSxKo+FM2gHoPsF9bdYsoFvLb2XMQDjeV128Jzson+cvo41dbdl+/MomHVAWyN1AHHoGkHS6XIAtnfUhR0a1gGnCmwfcw4XPL/lrCFCNwnqL3EuFDzfPmWVRH/xwcdb2wH3OLcWPGPZwTBR1GF/gzXFuAhLQP2485Lg+chs2rPl4BF9b0vh1voHJix1EM8whpG0iTPX2VAM0rAOOElgy0lkieD5Iktxu+QwQf2rzvaCj/raWVWw+jh9RczdyNoOmI44lZ1rSV8I6va39niuE9Rf6pwseH7Asg5W2WuiJ7ZSPYCSi50LBB9BGckMzrRuDesABg3YMvHPi3os0/GVZbFbKJsQR+g5TjWodgDfRSgDHPios6VArNpBDishxBAWASf+aHkH3yabs0RPZPZ+L+AycoI1c0QJZQdYfw3rAE5icRo7zXla8PyCc2cHhKLQOZbaXC4IlzwvEKh2wBxLYQL4np8s/UQCiFz0u8Ce3FCPoYSVHyKc0Wae+NRSmN9c9DTrgBXsAESiKpNVcKXliejHg9ZfwzhgkWUH85GbWXov0PaqbDqljQV3gG2KcsIGE/uy+MRSDlhXoOkcELpXZRGjV1N5nMKoIwfUIo8C4yFPho6z1IawBHzji0X9lPYQscp/FnT2rsoCksrRBQdaf4UDyPwQFxyOX0BcLncWJxoUSZWcw4rcRyDG9KagDTmqFBMfE0zfXORKdTmAix8LJcZzmcqJAkDZ+5aTL9rd+UHwvrkqR/RHrmTVA+05bPTVs5aMFgt0n8oCtvmwCgd0QaK6QnA9L0WSj90BnHAiFABncH7OKBXH2YBEXKrLAYh7RNQztj0t30sesTxm4AAQjob6iIpI6uW3ljukJeIUHhsTiF87yxj4fxywlWVnllwrTrF82ugntjxXeuCHsmWWjodQTz7i9BHv4XJX2zCRcfHDZr1mdU+MC6g/vSjnaMtOmBQfWtrF88V0Grc8nrOrupZmHZC0whyAFtYFliYB3rEhO5nVcPoPoabMsl4qiYMAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAB0UlEQVR4Xs3WvSuFURwH8J8MZJAoeSmTohAZvJTFwqREMlgpo9XLZDAZKZNISUxeisGGweJtIP+AEhYi7/y+z/md+zzP7557e1x58q3PwO+c87v3Puece4nCaWCr7Ja9iQs2wfJEF7v8oRWS9Itn9uXwyU5EOTt3jHHBPOgkSSyNqtiT0ANdk7ZYT+BvPS5oV3iZdQxI54PVs32h69Y7axJejhyDwL5ilyHWJtBYz4U1Uomt0ZkUdJM+UeSQ68002aDk+S9knn0oi5Q8EI2wUxLbMk3qyJy34Ny50AhJM5kHB5k0QhbIn/vAykJVSWyNkFGBBpk0qmCPYkrVnMFBPCWzkzpE1NgXW6ALNtkOpSxf6BpkeTP9YBdWimJVS0Qv8meNdsh8VFFh03STuVxhicw9GTzQOJu9pNJIybsunQNWza6ErltoOCYSWRZ6cJB9R+3s0FF3sW+glSSxNbIPMtUXH6yLFvLPW1R4jqHMkHuRV1YjhlOMwUUKNw57pFLC7im8ABadD4wZlP/pRtsiUmJrhExSeCHcX7jLbGrJbIpfN8JtcE3+4ZsOl71skl/PuBEywu5EoaohuGaOhW32vxvlsAGRKvYn8jiZn834OMGZb/fThMYqY/wCAAAAAElFTkSuQmCC>