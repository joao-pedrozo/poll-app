import { RiErrorWarningFill } from "react-icons/ri";
import ReactTooltip from "react-tooltip";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, label, error, ...rest }: InputProps, ref) => (
    <div className="w-full max-w-md">
      <label htmlFor={name}>
        <b>{label}</b>
      </label>
      <div
        className={`relative transition-all w-full h-9 border-4 rounded-md bg-slate-200 relative border-2 ${
          error && "border-red-200 bg-red-100"
        }`}
      >
        <input
          className="h-full w-full bg-transparent outline-0 pr-8 pl-4"
          type="text"
          name={name}
          id={name}
          ref={ref}
          {...rest}
        />
        {error && (
          <>
            <RiErrorWarningFill
              className="absolute right-2 text-red-500 top-2"
              data-tip={error}
            />
            <ReactTooltip
              textColor="#fff"
              backgroundColor="#f95e5a"
              type="error"
              effect="solid"
              place="top"
            />
          </>
        )}
      </div>
    </div>
  )
);

export default Input;
