import { React } from "../app"
import { useState, useRef, useEffect } from "react"
import { useAppContext } from "../contexts/context"

//Allows user to approve some actions
export function Approve() {
    //Whether approve panel is displayed
    let [isActivated, setIsActivated] = useState(false);
    //Data to approve
    let { approvalData } = useAppContext();

    const container = useRef(null);
    //Approve panel
    const approve = useRef(null);

    //Turns off approve panel
    useEffect(() => {
        if (container.current != null)
            container.current.addEventListener("click", (e) => {
                if (!approve.current.contains(e.target))
                    setIsActivated(false);
            });

    }, [isActivated]);

    //Activates approve panel
    useEffect(() => {
        if (approvalData != null)
            setIsActivated(true);

    }, [approvalData]);

    //Executes chosen decision
    function Action(decision) {
        setIsActivated(false);

        if (decision && approvalData != undefined)
            approvalData();
    }

    return (
        <div>
            {isActivated && <div ref={container} id="approveContainer">
                <div ref={approve} id="approve">
                    <label>Confirm action</label>
                    <div id="container">
                        <input onClick={() => Action(true)} type="button" className="accept" value="Yes" />
                        <input onClick={() => Action(false)} type="button" className="empty" value="No" />
                    </div>
                </div>
            </div>}
        </div>
    )
}