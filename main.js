const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const port = 3000;

app.use(express.json())


// Endpoint to handle incoming webhook requests
app.post('/api/v1/automate', async (req, res) => {
  // Call functions to add form, layer, and ticket
  try {
    // read projectId, userId from req parameters
    //const projectId= req.body.projectId;
    const projectId = req.body.data.id;
    console.log("hoooo",projectId);
    console.log("hohoho",req.body.data.attributes);
    //const userId = req.body.userId;
    const userId = req.body.data.attributes["parent-id-hashed"];
    console.log("heeee",userId);
    // read accesstoken from req headers
    //const accessToken = req.get('X-PlanRadar-API-Key')
    const accessToken = req.get('x-plan-radar-api-key')
    
    // First Step: Create Ticket-Type
    const ticketTypeId = await createTicketType(userId,accessToken)
    console.log("ticketTypeId: ",ticketTypeId)
    // Second Step: Assign created Ticket-Type to the recently created Project
    await assignProjectTicketType(userId,accessToken,projectId,ticketTypeId)
    
    // Third Step: Create Component Form or Layer
    const layerId = await createLayer(userId,accessToken,projectId);
    console.log("layerId: ",layerId)
    
    // Fourth Step: Create Ticket
    const ticketId = await createTicket(userId,accessToken,projectId, ticketTypeId, layerId);
    console.log("ticketId: ",ticketId)
    
    // Respond to the webhook with a success message
    res.status(200).send('Automation script executed successfully.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error executing automation script.');
  }
});

// Create a Ticket-Type
async function createTicketType(userId,accessToken) {
  const bodyData = {
      data:{
        attributes:{
          "name":"my-ticket"
        }
      }
  };

  const response = await axios.post(
    `https://www.planradar.com/api/v1/${userId}/ticket_types`,
    bodyData,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-PlanRadar-API-Key': accessToken
      }
    }
  );
  return response.data.data.id;
}

// Assign Ticket-Type to project
async function assignProjectTicketType(userId,accessToken,projectId,ticketTypeId) {
  const bodyData = {
    data:{
      attributes:{
        "ticket-type-id":ticketTypeId
      }
    }
  };

  await axios.post(
    `https://www.planradar.com/api/v1/${userId}/projects/${projectId}/ticket_types_project`,
    bodyData,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-PlanRadar-API-Key': accessToken
      }
    }
  );
}

// Create a Component or Layer (option: Uploading 1-page-pdf file from disk called Plan in the same directory)
async function createLayer(userId,accessToken,projectId) {
  var bodyFormData = new FormData();
  const fileStream = fs.createReadStream('./Plan.pdf');
  bodyFormData.append('data[][attributes][file]',fileStream);
  bodyFormData.append('data[][attributes][file-name]', 'Plan.pdf');
  bodyFormData.append('data[][attributes][layers][][page]', '1');
  const response = await axios.post(
    `https://www.planradar.com/api/v1/${userId}/projects/${projectId}/components`,
    bodyFormData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-PlanRadar-API-Key': accessToken
      }
    }
  );
  return response.data.data[0].id;
}

// Function to create a ticket
async function createTicket(userId,accessToken,projectId, ticketTypeId, layerId) {
  const bodyData = {
      data:{
        attributes:{
          "subject": "Ticket-title",
          "ticket-type-id": ticketTypeId,
          "status-id": 1,
          "component-id": layerId
        }
    }
  };

  const response = await axios.post(
    `https://www.planradar.com/api/v2/${userId}/projects/${projectId}/tickets`,
    bodyData,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-PlanRadar-API-Key': accessToken
      }
    }
  );
  return response.data.data.id;
}

// Running Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
