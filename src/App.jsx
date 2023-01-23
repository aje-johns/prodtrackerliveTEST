import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import "./App.css";

const db = new Dexie("production");
db.version(2).stores({
  production:
    "++id,startTime,date,activity,lob,policyNo,sydOrEu,amendmentOrNew,subId,assuredName,endTime,aht,comment",
});
const { production } = db;

function App() {
  const productionList = useLiveQuery(() => production.toArray(), []);
  const [userInput, setUserInput] = useState({
    startDate: "",
    activity: "",
    lob: "",
    policyNo: "",
    market: "",
    type: "",
    subId: "",
    assured: "",
    endDate: "",
    comments: "",
    aht: "",
  });
  function handleEndTime(e) {
    //here we have to add data  to the Database
    e.preventDefault();
    const endTime = new Date();
    setUserInput((prevData) => {
      return { ...prevData, endDate: endTime };
    });
  }
  const handleUserInputFieldChange = (e) => {
    e.preventDefault();
    let subIdRegex = /S-[0-9]*-[0-9]*/gim;
    let policyNumberRegex1 =
      /[0-9]{6}\/[0-9]{2}\/[0-9]{4}\/[0-9]{4}\/|[0-9]{6}\/[0-9]{2}\/[0-9]{4}\/[0-9]{4}|[0-9]{6}\/[0-9]{2}\/[0-9]{4}\/|[0-9]{6}\/[0-9]{2}\/[0-9]{4}/gm;
    const userEntry = document.querySelector("#inputDataRaw");
    const rulebookData = userEntry.value;
    console.log(rulebookData);
    function getStringBetween(delimiter1, delimiter2, string) {
      const regexStr = new RegExp(
        `(?<=${delimiter1})(.|\r|\n)*(?=${delimiter2})`,
        "gi"
      );
      const valueFound = string.match(regexStr);
      return valueFound;
    }
    const startDate = new Date();
    setUserInput((prevData) => {
      return { ...prevData, startDate };
    });
    const lobToBeEntered = getStringBetween("CLASS:", "BROKER:", rulebookData);
    setUserInput((prevData) => {
      return { ...prevData, lob: lobToBeEntered };
    });
    let policyNumberArray = rulebookData.match(policyNumberRegex1);
    const policyNoEntered = policyNumberArray;
    setUserInput((prevData) => {
      return { ...prevData, policyNo: policyNoEntered };
    });
    let marketEnteredArr = [];
    policyNumberArray &&
      policyNumberArray.forEach((item) => {
        marketEnteredArr.push(item.slice(7, 9));
      });
    let marketEnteredStr = marketEnteredArr.map((item) =>
      Number(item) >= 61 ? "SYD" : "EU"
    );
    setUserInput((prevData) => {
      return { ...prevData, market: marketEnteredStr };
    });
    // type
    //**************To check New/Renewal */
    // subId
    const subIdEntered = rulebookData.match(subIdRegex);
    if (subIdEntered) {
      subIdEntered.toString().toUpperCase();
    }
    setUserInput((prevData) => {
      return { ...prevData, subId: subIdEntered };
    });
    // assured
    const assuredEntered = getStringBetween(
      "ASSURED:",
      "BROKER CONTACT:",
      rulebookData
    );
    if (assuredEntered != null) {
      setUserInput((prevData) => {
        return { ...prevData, assured: assuredEntered };
      });
    }

    /**The following data needs to be updated from the card */
    // endDate
    // aht
    // comments
    console.log(userInput);
  };
  const handleActivityChange = (e) => {
    const activity = e.target.value;
    console.log(activity);
    setUserInput((prevData) => {
      return { ...prevData, activity: activity };
    });
  };
  const addToDB = async (e) => {
    // e.preventDefault();
    const startTimeObj = userInput.startDate;
    const startTime =
      startTimeObj.getHours() +
      ":" +
      startTimeObj.getMinutes() +
      ":" +
      startTimeObj.getSeconds();
    // let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    const endDateObj = userInput.endDate;
    const endTime =
      endDateObj.getHours() +
      ":" +
      endDateObj.getMinutes() +
      ":" +
      endDateObj.getSeconds();
    const date = startTimeObj.toLocaleDateString("en-US");
    console.log("endTime - startTime");
    // console.log(setMinutes(endDateObj.getTime() - startTimeObj.getTime()));
    await production.add({
      date: date,
      startTime: startTime,
      endTime: endTime,
      activity: userInput["activity"],
      lob: userInput["lob"],
      policyNo: userInput["policyNo"],
      sydOrEu: userInput["market"],
      amendmentOrNew: userInput["type"],
      subId: userInput["subId"],
      assuredName: userInput["assured"],
      // aht: userInput[""],
      aht: "to be Calculated",
      // comment: userInput[""],
      comment: "to be Added",
    });
  };
  // handleFormSubmit;
  return (
    <>
      <main className="container main">
        <header>
          <nav></nav>
        </header>
        <section className="grid">
          <div className="form-sec">
            <form>
              <fieldset>
                <legend>Activity</legend>
                <select
                  name="Activity List"
                  id="activityDropdown"
                  onChange={handleActivityChange}
                >
                  <option value="open market slip entry">OM slip</option>

                  <option value="open market Decleration Creation">
                    OM Dec
                  </option>
                  <option value="Intrali Report">Intrali</option>
                  <option value="etc">Etc</option>
                </select>
              </fieldset>
              <fieldset>
                <label>Bulk Data</label>
                <input
                  id="inputDataRaw"
                  type="textarea"
                  name="userBulkData"
                  placeholder="Paste Data here"
                  onChange={handleUserInputFieldChange}
                ></input>
              </fieldset>
            </form>
          </div>
          <div>
            <form>
              <div className="border">
                <input type="text" placeholder="LOB" value={userInput.lob} />
                <input
                  type="text"
                  placeholder="EU/SYD"
                  defaultValue={userInput.market}
                />
                <input
                  type="text"
                  placeholder="Policy Number"
                  defaultValue={userInput.policyNo}
                />
                <input
                  type="text"
                  placeholder="Submission ID"
                  defaultValue={userInput.subId}
                />
                <input
                  type="text"
                  placeholder="Assured Name"
                  defaultValue={userInput.assured}
                />
                <button
                  type="submit"
                  className="end-btn"
                  onClick={handleEndTime}
                >
                  End
                </button>
                <button
                  type="submit"
                  className="add-to-table-btn"
                  onClick={addToDB}
                >
                  Add To Table
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <article>
        <header>Production</header>
        <section className="tableContainer">
          <figure>
            <table role={"grid"} className="table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>LOB</th>
                  <th>Policy Number</th>
                  <th>SYD/EU</th>
                  <th>Amendment/New</th>
                  <th>Sub-ID</th>
                  <th>Assured Name</th>
                  <th>End</th>
                  <th>AHT</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {productionList?.map(
                  ({
                    startTime,
                    date,
                    activity,
                    lob,
                    policyNo,
                    sydOrEu,
                    amendmentOrNew,
                    subId,
                    assuredName,
                    endTime,
                    aht,
                    comment,
                  }) => {
                    return (
                      <tr>
                        <td>{startTime}</td>
                        <td>{date}</td>
                        <td>{activity}</td>
                        <td>{lob}</td>
                        <td>{policyNo}</td>
                        <td>{sydOrEu}</td>
                        <td>{amendmentOrNew}</td>
                        <td>{subId}</td>
                        <td>{assuredName}</td>
                        <td>{endTime}</td>
                        <td>{aht}</td>
                        <td>{comment}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
              {/* <tr>
                  <td>lastname</td>
                  <td>email</td>
                  <td>f</td>
                  <td>lastname</td>
                  <td>email</td>
                  <td>f</td>
                  <td>lastname</td>
                  <td>email</td>
                  <td>f</td>
                  <td>lastname</td>
                  <td>email</td>
                  <td>email</td>
                </tr> */}
            </table>
          </figure>
        </section>
      </article>
      <footer>
        <p className="text-center">Developed By AJ3</p>
      </footer>
    </>
  );
}

export default App;
