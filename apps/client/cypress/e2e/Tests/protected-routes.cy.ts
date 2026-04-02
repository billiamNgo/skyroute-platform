describe("Protected route access", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("redirects unauthenticated users from /technician to /login", () => {
        cy.visit("/technician");
        cy.location("pathname").should((path) => {
            expect(["/", "login"]).to.include(path);
        });
    });

    it("redirects unauthenticated users from /admin to /login", () => {
        cy.visit("/admin");
        cy.location("pathname").should((path) => {
            expect(["/", "login"]).to.include(path);
        });
    });

    it("redirects unauthenticated users from /orders to /login", () => {
        cy.visit("/orders");
        cy.location("pathname").should((path) => {
            expect(["/", "login"]).to.include(path);
        });
    });
});

