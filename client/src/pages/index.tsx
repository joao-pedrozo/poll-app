import type { NextPage } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import { BsTrash, BsPlus } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import Router from "next/router";

interface Option {
  id: `option-${number}`;
}

type FormValues = {
  pollTitle: "";
  [key: `option-${number}`]: string;
};

const Home: NextPage = () => {
  const [options, setOptions] = useState<Option[]>([
    {
      id: "option-1",
    },
    {
      id: "option-2",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    unregister,
  } = useForm<FormValues>({
    defaultValues: {
      pollTitle: "",
      "option-1": "Yes",
      "option-2": "No",
    },
  });
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/poll`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      const createdPolls =
        JSON.parse(localStorage.getItem("createdPolls")) || [];

      localStorage.setItem(
        "createdPolls",
        JSON.stringify(createdPolls.concat(responseData.id))
      );

      Router.push(responseData.id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddOption = (
    event: React.MouseEvent<HTMLElement>,
    clickedOptionIndex: number
  ) => {
    event.preventDefault();

    const newOptions: Option[] = Array.from(
      { length: options.length + 1 },
      (_, i) => ({
        id: `option-${i + 1}`,
      })
    );

    setOptions(newOptions);

    const values = getValues();

    newOptions.forEach((option, index) => {
      if (index === clickedOptionIndex + 1) {
        setValue(option.id, "");
      }

      if (index > clickedOptionIndex + 1) {
        const optionNumber = parseInt(option.id.split("-")[1]);
        setValue(option.id, values[`option-${optionNumber - 1}`]);
      }
    });
  };

  const handleRemoveOption = (
    event: React.MouseEvent<HTMLElement>,
    clickedOptionIndex: number
  ) => {
    event.preventDefault();

    const newOptions: Option[] = Array.from(
      { length: options.length - 1 },
      (_, i) => ({
        id: `option-${i + 1}`,
      })
    );

    setOptions(newOptions);

    const values = getValues();

    newOptions.forEach((option, index) => {
      if (index >= clickedOptionIndex) {
        const optionNumber = parseInt(option.id.split("-")[1]);
        setValue(option.id, values[`option-${optionNumber + 1}`]);
      }
    });

    unregister(`option-${newOptions.length + 1}`);
  };

  return (
    <div className="mx-5">
      <h1 className="w-96 h-20 mt-3 mx-auto font-bold text-transparent text-6xl">
        Create a poll
      </h1>
      <div className="mx-auto flex justify-center">
        <form
          className="flex items-center flex-col w-full max-w-md gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            name="pollTitle"
            label="Poll Title"
            error={errors.pollTitle?.message}
            maxLength={50}
            placeholder="Should I stay or should I go?"
            {...register("pollTitle", {
              required: "Required Field",
            })}
          />
          <ul className="w-full flex flex-col gap-2">
            {options.map((option, index) => (
              <li
                id={option.id}
                key={option.id}
                className="flex justify-center gap-2 items-end"
              >
                <Input
                  name={option.id}
                  label={`Option ${index + 1}`}
                  error={errors[option.id]?.message}
                  maxLength={50}
                  {...register(option.id, {
                    required: "Required Field",
                    maxLength: {
                      value: 50,
                      message: "Too many caracters",
                    },
                  })}
                />
                <button
                  className="border-4 rounded-md bg-slate-200 h-9"
                  onClick={(event) => handleAddOption(event, index)}
                  disabled={options.length === 10}
                >
                  <BsPlus />
                </button>
                <button
                  onClick={(event) => handleRemoveOption(event, index)}
                  className="border-4 rounded-md bg-slate-200 cursor-pointer h-9"
                  disabled={options.length === 2}
                >
                  <BsTrash />
                </button>
              </li>
            ))}
          </ul>
          <button
            className="rounded-md bg-orange-600 hover:bg-orange-700 transition-all h-10 w-28 mt-3 font-medium text-white flex items-center justify-center"
            type="submit"
          >
            {!isLoading ? (
              "Create poll"
            ) : (
              <ImSpinner8 className="animate-spin" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
