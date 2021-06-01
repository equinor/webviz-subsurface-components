import "@testing-library/jest-dom/extend-expect";
import "jest-styled-components";

/*
The following tests are breaking due to jest trying to parse a non-js file,
needs investigation to solve this problem.
*/
describe("test attributes selector", () => {
    it("snapshot test", () => {
        // const { container } = render(
        //     Wrapper({ children: <WellAttributesSelector /> })
        // );
        // expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        // render(<WellAttributesSelector />, {
        //     wrapper: Wrapper,
        // });
        // fireEvent.click(
        //     screen.getByRole("button", { name: "Go to next page" })
        // );
        // expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        // expect(testStore.dispatch).toBeCalledWith({
        //     payload: 1,
        //     type: "ui/updateCurrentPage",
        // });
    });
});
