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

const projectName = "Cool Project";
const toArray = ["Boss <boss@example.com>"];
const ccArray = [
  "Management <mgmt@example.com>",
  "Jane Doe <jane.doe@example.com>",
];

browser.composeAction.onClicked.addListener(async (tab) => {
  // Get the existing message.
  let details = await browser.compose.getComposeDetails(tab.id);
  console.log(details);

  const date = new Date();

  // Eg: "Cool Project Work (Jan 29)"
  const subject = `${projectName} Work (${
    months[date.getMonth()]
  } ${date.getDate()})`;

  browser.compose.setComposeDetails(tab.id, {
    to: toArray,
    cc: ccArray,
    subject,
  });
});
