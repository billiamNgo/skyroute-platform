describe("Role-based login redirects", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("logs in a technician and redirects to /technician", () => {
        cy.intercept("POST", "http://localhost:8080/auth/login", {
            statusCode: 200,
            body: {
                token: "tech-token",
                user: {
                    email: "tech@test.com",
                    role: "technician",
                },
            },
        }).as("loginRequest");

        cy.visit("/login");

        cy.get('input[placeholder="Enter email"]').type("tech@test.com");
        cy.get('input[placeholder="Enter password"]').type("password123");
        cy.get('button[type="submit"]').click();

        cy.wait("@loginRequest");
        cy.url().should("include", "/technician");
        cy.contains("Technician Dashboard").should("be.visible");

        cy.window().then((win) => {
            expect(win.localStorage.getItem("token")).to.equal("tech-token");
            expect(win.localStorage.getItem("role")).to.equal("technician");
            expect(win.localStorage.getItem("email")).to.equal("tech@test.com");
        });
    });

    it("logs in an admin and redirects to /admin", () => {
        cy.intercept("POST", "http://localhost:8080/auth/login", {
            statusCode: 200,
            body: {
                token: "admin-token",
                user: {
                    email: "admin@test.com",
                    role: "admin",
                },
            },
        }).as("loginRequest");

        cy.visit("/login");

        cy.get('input[placeholder="Enter email"]').type("admin@test.com");
        cy.get('input[placeholder="Enter password"]').type("password123");
        cy.get('button[type="submit"]').click();

        cy.wait("@loginRequest");
        cy.url().should("include", "/admin");
        cy.contains("Admin Dashboard").should("be.visible");

        cy.window().then((win) => {
            expect(win.localStorage.getItem("token")).to.equal("admin-token");
            expect(win.localStorage.getItem("role")).to.equal("admin");
            expect(win.localStorage.getItem("email")).to.equal("admin@test.com");
        });
    });
});