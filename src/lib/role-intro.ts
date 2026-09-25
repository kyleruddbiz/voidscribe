let resolveThirdRoleNearlyDone: () => void;

export const thirdRoleNearlyDone = new Promise<void>((resolve) => {
  resolveThirdRoleNearlyDone = resolve;
});

export const markThirdRoleNearlyDone = () => resolveThirdRoleNearlyDone();
