# PlanRadar Integration Automation Script

## Overview

This automation script is designed to integrate with PlanRadar, a SaaS application for construction documentation and defect management. It automatically performs certain actions whenever a new project is created in PlanRadar:

- Create ticket type
- Assign ticket type to recently created project
- Create a layer or component
- Create ticket

## prerequisites

- install Nodejs

## Implementation

The automation script is written in JS and gets triggered when a new project is created on PlanRadar using api call. When called, it performs the following actions:

1. **Add Sample Form**: Creates a project ticket type (form) and adds it to the newly created project.

2. **Add Empty Layer**: Creates an empty layer and adds it to the newly created project.

3. **Create Ticket**: Using the IDs of the newly created form and layer, creates a ticket on the project with a sample title and status.

## Usage

**Run the Script**: Execute the script using the command `node main.js`.


## Dependencies

The script relies on the following dependencies:
- `express`: A nodejs web framework for handling HTTP requests.
- `axios`: A JS library used to make HTTP requests from nodejs.
- `fs`: A JS library for dealing with files.
- `form-data`: A JS library for uploading files and data in request.

## License

This project is licensed under the [MIT License](LICENSE).
