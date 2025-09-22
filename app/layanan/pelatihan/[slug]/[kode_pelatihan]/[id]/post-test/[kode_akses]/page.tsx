"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Countdown from "react-countdown";
import Toast from "@/commons/Toast";
import { Button } from "@/components/ui/button";
import { TbClock } from "react-icons/tb";
import { IoMdCloseCircle } from "react-icons/io";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function Page() {
  type SoalUser = {
    Soal: Soal[];
    jumlah: number;
  };

  type Soal = {
    CreateAt: string;
    UpdateAt: string;
    IdLemdik: number;
    IdPelatihan: number;
    IdSoalUjian: number;
    Jawaban: Jawaban[];
    Soal: string;
    Status: string;
  };

  type Jawaban = {
    CreateAt: string;
    IdJawaban: number;
    IdSoalUjian: number;
    NameJawaban: string;
    Status: string;
    UpdateAt: string;
  };

  type JawabanUser = {
    id_soal_lemdik: string;
    jawaban_pengguna: string;
  };

  const [soalUser, setSoalUser] = useState<SoalUser | null>(null);
  const [selectedIdSoal, setSelectedIdSoal] = useState<number>(0);
  const [countSoal, setCountSoal] = useState<number>(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<JawabanUser[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null); // New state to handle radio button selection
  const countdownEndTimeRef = useRef<number>(Date.now() + 900000);
  const router = useRouter();

  const TIMER_KEY_POST = "countdown_end_time_post";
  const DEFAULT_TIME_LIMIT = 900000; // 15 minutes

  const handleAnswerChange = (idSoal: string, jawabanPengguna: string) => {
    setSelectedAnswers((prevAnswers) => {
      const updatedAnswers = prevAnswers.filter(
        (answer) => answer.id_soal_lemdik !== idSoal
      );
      updatedAnswers.push({
        id_soal_lemdik: idSoal,
        jawaban_pengguna: jawabanPengguna,
      });

      // Add this question to the answered list
      setAnsweredQuestions((prev) => [...prev, parseInt(idSoal)]);
      setSelectedRadio(jawabanPengguna); // Set the selected radio button

      return updatedAnswers;
    });
  };

  const handleSubmitExam = async (e: any) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/SumbitExam`,
        selectedAnswers,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF089999")}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil mensubmit jawaban post-test mu, silahkan lihat score pada dashboard pelatihanmu!`,
      });
      router.replace("/dashboard");
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: `Kesalahan di server, gagal mensubmit jawaban post-test mu!`,
      });
    }
  };

  const handleFetchingSoalUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/getSoalUsers`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF089999")}`,
          },
        }
      );

      // Acak urutan soal sebelum menetapkannya ke setSoalUser
      const shuffledSoal = response.data.Soal.sort(() => Math.random() - 0.5);
      setSoalUser({ ...response.data, Soal: shuffledSoal });
    } catch (e) {
      console.log("ERROR FETCH SOAL USER : ", e);
    }
  };

  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    handleFetchingSoalUsers();

    // Check if there's an existing end time in localStorage
    const savedEndTime = localStorage.getItem(TIMER_KEY_POST);
    const currentTime = Date.now();

    if (savedEndTime) {
      const parsedEndTime = parseInt(savedEndTime, 10);
      if (parsedEndTime > currentTime) {
        // Continue with the stored end time
        setEndTime(parsedEndTime);
      } else {
        // Timer has expired, start a new countdown
        const newEndTime = currentTime + DEFAULT_TIME_LIMIT;
        setEndTime(newEndTime);
        localStorage.setItem(TIMER_KEY_POST, newEndTime.toString());
      }
    } else {
      // No saved timer, start a new countdown
      const newEndTime = currentTime + DEFAULT_TIME_LIMIT;
      setEndTime(newEndTime);
      localStorage.setItem(TIMER_KEY_POST, newEndTime.toString());
    }

    // Add event listener to warn user if they try to refresh or leave the page
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Standard message
      return ""; // Legacy browser support
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Disable right-click and copy actions
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopy);

    // Clean up the event listeners
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopy);
    };
  }, []);

  return (
    <section className="w-full h-screen bg-gray-900 grid items-center justify-center text-white relative">
      <div className="flex flex-col max-w-6xl w-full h-fit mx-auto items-center justify-center gap-10 relative">
        <div className="w-fit flex gap-2 justify-end text-2xl font-medium text-white items-center absolute right-0 top-0">
          <TbClock />
          {endTime && <Countdown date={endTime} />}
        </div>
        <div className="rounded-md h-[400px] w-full px-6 pt-10 pb-5">
          <h2 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 text-4xl">
            Soal No. {selectedIdSoal + 1}
          </h2>
          <h3 className="text-white leading-[110%] text-2xl font-semibold">
            {soalUser && soalUser.Soal[selectedIdSoal]?.Soal} ?
          </h3>
          <div className="flex flex-col items-start justify-start gap-1 mt-5">
            {soalUser &&
              soalUser.Soal[selectedIdSoal]?.Jawaban.slice(1).map(
                (jawaban: Jawaban, index: number) => (
                  <div key={index} className="flex items-start w-full mb-4">
                    <input
                      type="radio"
                      value={jawaban.NameJawaban}
                      name="default-radio"
                      checked={selectedRadio === jawaban.NameJawaban} // Make radio button controlled
                      className="w-4 h-4 text-blue-600"
                      onChange={() =>
                        handleAnswerChange(
                          soalUser.Soal[selectedIdSoal].IdSoalUjian.toString(),
                          jawaban.NameJawaban
                        )
                      }
                    />
                    <label className="ms-2 text-lg font-medium text-white">
                      {String.fromCharCode(65 + index)}. {jawaban.NameJawaban}
                    </label>
                  </div>
                )
              )}
          </div>
          <div className="flex w-full items-center justify-end">
            {soalUser && soalUser.Soal.length === countSoal - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={handleSubmitExam}
                    className="w-fit text-lg p-4 bg-blue-500 hover:bg-blue-600"
                  >
                    Submit
                  </Button>
                </AlertDialogTrigger>
              </AlertDialog>
            ) : (
              <Button
                className="w-fit text-lg px-8 py-6 bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  setSelectedIdSoal(selectedIdSoal + 1);
                  setCountSoal(countSoal + 1);
                  setSelectedRadio(null); // Reset radio button selection when moving to the next question
                }}
              >
                Selanjutnya
              </Button>
            )}
          </div>
        </div>

        {/* Number Map with dynamic background */}
        <div className="flex flex-wrap gap-3 w-fit mt-16 items-center justify-center">
          {soalUser &&
            soalUser.Soal.map((soal, index) => (
              <div
                key={index}
                onClick={() => setSelectedIdSoal(index)}
                className={`flex cursor-pointer items-center justify-center rounded-full w-14 h-14 border border-white ${answeredQuestions.includes(soal.IdSoalUjian)
                  ? "bg-blue-500"
                  : "bg-transparent"
                  }`}
              >
                {index + 1}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default Page;
