import { Accordion, Badge, Button } from "@mantine/core";
import { FaMusic, FaRegCalendar, FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";
import { Loader } from "@mantine/core";
import { useNavigate } from "react-router";

type AccordianProps = {
  fileName: string;
  id: string;
  date: Date;
  token: string;
  status: number;
};

const AccordionComponent = ({
  fileName,
  id,
  date,
  token,
  status,
}: AccordianProps) => {
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deleteJob = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_DB_ENDPOINT}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ id: id }),
      });
    } catch (err) {
      console.warn(err);
      setLoading(false);
      return;
    }
    setLoading(false);
    setHidden(true);
  };

  return (
    <>
      {hidden ? null : (
        <Accordion.Item value={id}>
          <Accordion.Control>
            <h4>
              <FaMusic />
              &nbsp;&nbsp;&nbsp;
              {fileName.replace(".mp3", "").replace(".wav", "")}
            </h4>
            {status == 0 ? <Badge color="yellow">Pending</Badge> : null}
            {status == 1 ? <Badge color="blue">In progress</Badge> : null}
            {status == 2 ? <Badge color="green">Completed</Badge> : null}
          </Accordion.Control>
          <Accordion.Panel ta="left">
            <FaRegCalendar /> &nbsp;Uploaded on{" "}
            {new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Accordion.Panel>
          <Accordion.Panel ta="left">
            {status == 2 ? (
              <>
                <Button
                  variant="filled"
                  onClick={() => navigate(`/transcription?id=${id}`)}
                >
                  View transcription
                </Button>
                &nbsp;&nbsp;
              </>
            ) : null}
            <Button variant="filled" color="red" onClick={() => deleteJob(id)}>
              {loading ? (
                <Loader color="white" size="xs" />
              ) : (
                <>
                  <FaRegTrashCan />
                  &nbsp;&nbsp; Delete
                </>
              )}
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      )}
    </>
  );
};

export default AccordionComponent;
