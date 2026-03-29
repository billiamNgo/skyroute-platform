export interface User {
    userID: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    // optional link to a pharmacy when the user is a pharmacy/service account
    pharmacyID?: number | null;
}