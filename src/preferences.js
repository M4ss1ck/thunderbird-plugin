const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("preferences-form");
  const toArrayInput = document.getElementById("to-array");
  const ccArrayInput = document.getElementById("cc-array");
  const projectNameInput = document.getElementById("project-name");

  browser.storage.local
    .get(["toArray", "ccArray", "projectName"])
    .then((result) => {
      toArrayInput.value = result.toArray?.join(",") || "";
      ccArrayInput.value = result.ccArray?.join(",") || "";
      projectNameInput.value = result.projectName || "";
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("submit listener here...");
    let tabId = undefined;
    await browser.storage.local.get(["tabId"]).then((result) => {
      if (result.tabId) {
        tabId = result.tabId;
      }
    });

    console.log("tabId after getting it from storage: ", tabId);

    const toArray = toArrayInput.value.split(",");
    const ccArray = ccArrayInput.value.split(",");
    const projectName = projectNameInput.value;

    if (tabId) {
      console.log("About to set details");
      const date = new Date();
      const subject = `${projectName} Work (${
        months[date.getMonth()]
      } ${date.getDate()})`;
      browser.compose
        .setComposeDetails(tabId, {
          to: toArray,
          cc: ccArray,
          subject,
        })
        .then(() => {
          browser.storage.local
            .set({
              toArray,
              ccArray,
              projectName,
            })
            .then(() => window.close());
        })
        .catch((e) => console.log("error setting compose details: ", e));
    } else {
      console.log("no tab id found. Closing...");
      window.close();
    }
  });
});
