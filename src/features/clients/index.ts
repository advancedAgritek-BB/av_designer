/**
 * Clients Feature - Public API
 */

// Types
export type {
  Client,
  ClientAddress,
  ClientContact,
  ClientPriceBookEntry,
  ClientWithContacts,
  ClientWithChildren,
  ClientFull,
  CreateClientData,
  UpdateClientData,
  CreateContactData,
  UpdateContactData,
  CreatePriceBookEntryData,
} from './client-types';

// Service
export { ClientService } from './client-service';

// Hooks
export {
  CLIENT_KEYS,
  useClientList,
  useTopLevelClients,
  useClient,
  useClientChildren,
  useClientSearch,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useClientContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useClientPriceBook,
  useCreatePriceBookEntry,
  useDeletePriceBookEntry,
} from './use-clients';

// Components
export { ClientCard } from './components/ClientCard';
export { ClientList } from './components/ClientList';
export { ClientsPage } from './components/ClientsPage';
export { ClientDetailPage } from './components/ClientDetailPage';
export { ClientOverviewTab } from './components/ClientOverviewTab';
export { ClientContactsTab } from './components/ClientContactsTab';
