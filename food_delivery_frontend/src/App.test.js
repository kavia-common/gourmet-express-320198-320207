import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./state/AppContext";

test("renders Restaurants heading", () => {
  render(
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  );

  const heading = screen.getByText(/restaurants/i);
  expect(heading).toBeInTheDocument();
});
