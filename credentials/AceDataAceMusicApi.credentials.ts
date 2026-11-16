import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class AceDataAceMusicApi implements ICredentialType {
  name = "aceDataAceMusicApi";
  displayName = "ACE Music by Ace Data Cloud API";
  documentationUrl = "https://github.com/AceDataCloud/ACEMusicN8N#credentials";
  icon = "file:../nodes/AceMusic/icon.png" as const;
  properties: INodeProperties[] = [
    {
      displayName: "API Token",
      name: "apiToken",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "The API token for your ACE Music service on AceDataCloud",
    },
    {
      displayName:
        'Create or copy an application API key in <a href="https://platform.acedata.cloud/console/applications?utm_source=opensource&utm_medium=referral&utm_campaign=evergreen&utm_content=acemusicn8n_credential_api_key" target="_blank">Ace Data Cloud Applications</a>. Paste only the token into API Token; do not add Bearer.',
      name: "keySetup",
      type: "notice",
      default: "",
    },
  ];
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: { Authorization: "=Bearer {{$credentials.apiToken}}" },
    },
  };
  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://api.acedata.cloud",
      url: "/acemusic/tasks",
      method: "POST",
      body: { action: "list", limit: 1, offset: 0 },
    },
  };
}
