
import * as React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import OtpPage from "./page";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

// Mocks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({
    get: () => "+1234567890",
  }),
}));

jest.mock("@/firebase", () => ({
  useFirebase: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("OtpPage", () => {
  let push, toast;

  beforeEach(() => {
    push = jest.fn();
    toast = jest.fn();
    useRouter.mockReturnValue({ push });
    useToast.mockReturnValue({ toast });

    // Mock window.confirmationResult
    (window as any).confirmationResult = {
      confirm: jest.fn(),
    };
  });

  it("should redirect to the correct dashboard based on user role", async () => {
    const roles = ["Admin", "Secretary", "Disciplinarian", "Singer"];

    for (const role of roles) {
      // Mock getDoc to return a user with the specified role
      const getDoc = jest.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ role }),
      });

      useFirebase.mockReturnValue({
        firestore: {
          doc: () => ({}),
          getDoc,
        },
      });

      (window as any).confirmationResult.confirm.mockResolvedValue({
        user: { uid: "123" },
      });

      const { getByText, getByLabelText } = render(<OtpPage />);

      fireEvent.change(getByLabelText("One-Time Password"), {
        target: { value: "123456" },
      });
      fireEvent.click(getByText("Verify"));

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(`/${role.toLowerCase()}/dashboard`);
      });
    }
  });
});
