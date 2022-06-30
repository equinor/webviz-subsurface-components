describe("Map component feature", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.getIframeBody().find(
            "#root > div > div:nth-child(3) > svg[role='progressbar']",
            {
                timeout: 20000,
            }
        );

        cy.get("#storybook-panel-root").then(($body) => {
            if ($body.is(":visible")) {
                cy.get("body").type("a");
            }
        });

        cy.get("body").then(($body) => {
            if ($body.find("nav.sidebar-container").length > 0) {
                cy.get("body").type("s");
            }
        });

        // cy.get("body").then(($body) => {
        //     if ($body.find("#root > div > div.css-1q7pov5 > nav").length > 0) {
        //         cy.get("body").type("s");
        //     }
        //     if (
        //         $body.find("#root > div > div.react-draggable.css-p5zfqk")
        //             .length > 0
        //     ) {
        //         cy.get("body").type("a");
        //     }
        // });
        cy.getIframeBody()
            .find("#root > div > div:nth-child(3) > svg[role='progressbar']", {
                timeout: 30000,
            })
            .should("not.exist");
    });

    it("Should update distance sacle", () => {
        cy.getIframeBody()
            .find("#DeckGL-Map-wrapper")
            .trigger("wheel", { deltaY: -50, force: true });
        cy.wait(1000);
        cy.compareSnapshot("zoom-in");
    });
});
