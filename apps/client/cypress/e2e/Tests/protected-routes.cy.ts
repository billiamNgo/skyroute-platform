describe("Protected route access", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("redirects unauthenticated users from /technician to /login", () => {
        cy.visit("/technician");
        cy.url().should("include", "/login");
        cy.contains("Login").should("be.visible");
    });

    it("redirects unauthenticated users from /admin to /login", () => {
        cy.visit("/admin");
        cy.url().should("include", "/login");
        cy.contains("Login").should("be.visible");
    });

    it("redirects unauthenticated users from /orders to /login", () => {
        cy.visit("/orders");
        cy.url().should("include", "/login");
        cy.contains("Login").should("be.visible");
    });
});

