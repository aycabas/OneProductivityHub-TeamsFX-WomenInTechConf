// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import './App.css';

import { TeamsFx } from "@microsoft/teamsfx";
import { Button } from "@fluentui/react-northstar"

import { Providers, ProviderState } from '@microsoft/mgt-element';
import {  Agenda, Todo, FileList, Person, PersonViewType, PersonCardInteraction } from '@microsoft/mgt-react';


import { TeamsFxProvider } from '@microsoft/mgt-teamsfx-provider';
import { CacheService } from '@microsoft/mgt';

class Tab extends React.Component {

  constructor(props) {
    super(props);
    CacheService.clearCaches();

    this.state = {
      showLoginPage: undefined,
     
    }
  }

  async componentDidMount() {

    /*Initialize TeamsFx */
    this.teamsfx = new TeamsFx();

    this.scope = [
      "User.Read",
      "User.ReadBasic.All",
      "Calendars.Read",
      "Files.Read",
      "Files.Read.All",
      "Sites.Read.All",
      "Tasks.Read",
      "Tasks.ReadWrite"
    ];

    /*Initialize Graph Toolkit */
    const provider = new TeamsFxProvider(this.teamsfx, this.scope)
    Providers.globalProvider = provider;
   
    /*Check if consent is needed*/
    let consentNeeded = false;
    try {
      await this.teamsfx.getCredential().getToken(this.scope);
    } catch (error) {
      consentNeeded = true;
    }
    this.setState({
      showLoginPage: consentNeeded
    });
    Providers.globalProvider.setState(consentNeeded ? ProviderState.SignedOut : ProviderState.SignedIn);
    return consentNeeded;

  }

 

  async loginBtnClick() {
    try {
      await this.teamsfx.login(this.scope);
      Providers.globalProvider.setState(ProviderState.SignedIn);
      this.setState({
        showLoginPage: false
      });
    } catch (err) {
      if (err.message?.includes("CancelledByUser")) {
        const helpLink = "https://aka.ms/teamsfx-auth-code-flow";
        err.message += 
          "\nIf you see \"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application\" " + 
          "in the popup window, you may be using unmatched version for TeamsFx SDK (version >= 0.5.0) and Teams Toolkit (version < 3.3.0) or " +
          `cli (version < 0.11.0). Please refer to the help link for how to fix the issue: ${helpLink}` ;
      }

      alert("Login failed: " + err);
      return;
    }
  }


  render() {

   
   
    return (
      <div>
        {
        this.state.showLoginPage === false && 
        
        <div>
        <div className='features-avatar'>
          <Person personQuery="me" view={PersonViewType.threelines} ></Person>
        </div>
         <div className="features">
          <div className="header">
            <div className="title">
                <h2>One Productivity Hub</h2>
             
            </div>
          </div>

       
          <div class="row" id="content">
    
                  <div class="column" id="mgt-col">
                    <Agenda></Agenda>
                  </div>
                  <div class="column" id="mgt-col">
                    <Todo></Todo>
                  </div>
                  <div class="column" id="mgt-col">
                    <FileList></FileList>
                  </div>
                  
          </div>

          </div>
        </div>
           
        }

        {
        this.state.showLoginPage === true && 
        <div className="auth">
        
          {<Button primary onClick={() => this.loginBtnClick()}>Consent Permissions</Button>}
     
        </div>}
      </div>
      
    );
  }
}
export default Tab;