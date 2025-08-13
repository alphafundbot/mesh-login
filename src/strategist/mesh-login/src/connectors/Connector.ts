// src/connectors/Connector.ts

export interface AuthContext {
    user: any; // Replace with your actual User type
}

export interface Session {
    user: any; // Replace with your actual User type
    [key: string]: any;
}

export interface Resource {
    connectorId: string;
    [key: string]: any;
}

export interface QueryParams {
    [key: string]: any;
}

export interface Capabilities {
    name: string;
    capabilities: string[];
}

export interface Connector {
  id: string;
  discover(): Promise<Capabilities>;
  authenticate(ctx: AuthContext): Promise<Session>;
  fetchResources(session: Session, params: QueryParams): Promise<Resource[]>;
  returnToPlatform(data: Resource[]): Promise<void>;
}
