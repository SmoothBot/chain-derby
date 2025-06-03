import { useModal } from "@/hooks/useModal";
import { Button, Checkbox } from "./ui";
import { useState } from "react";
import { CheckedState } from "@radix-ui/react-checkbox";

export function Terms() {
  const { onClose } = useModal();
  const [isAccepted, setIsAccepted] = useState<CheckedState>(false);

  function handleOnClose() {
    localStorage.setItem("terms", `${isAccepted}`);
    onClose();
  }

  return (
    <div>
      <p className="text-xl font-bold p-6 pt-8">Terms and Condition</p>
      <div className="flex flex-col gap-4 px-6 md:px-10 py-4 max-h-[75vh] overflow-auto">
        <p className="text-sm">
          The RISE Testnet (<span className="font-bold">“Testnet”</span>) is
          made available to solely for testing and development purposes. It is
          designed as a simulated environment for partners, developers and users
          to test the features therein and is not intended for use with any real
          assets, such as stablecoins, cryptocurrencies, tokens or other forms
          of digital assets (collectively, the{" "}
          <span className="font-bold">“Digital Assets”</span>
          ).{" "}
        </p>

        <p className="text-sm">
          The Testnet operates on a decentralised basis, and consequently, any
          person (such as partners, developers and users) may use the Testnet
          for the purposes of launching, managing, deployment and operating
          their own projects, products and services on or through the Testnet
          (each a <span className="font-bold">“Third-Party Project”</span>).
          [Rise Labs] (the <span className="font-bold">“Company”</span>,{" "}
          <span className="font-bold">“our”</span>,{" "}
          <span className="font-bold">“we”</span> or{" "}
          <span className="font-bold">“us”</span>) does not have control or
          oversight of the launch, management, deployment and operation of any
          Third-Party Project, and we are unable to independently assess or
          verify the legitimacy, authenticity or validity of any Third-Party
          Projects.
        </p>

        <p className="text-sm">
          Any mention of, reference of, feature of, or any information provided
          relating to, any Third-Party Project (collectively, the{" "}
          <span className="font-bold">“Project Content”</span>) on our websites,
          social media, or other communication channels does not constitute an
          endorsement, recommendation, or validation of such Third-Party
          Project’s legitimacy, authenticity or validity by the Company.
        </p>

        <p className="text-sm">
          At all times, please note that: (a) such Project Content is presented
          to you on an “as is” basis for general information purposes only,
          without representation or warranty of any kind; and (b)
          correspondingly, the posting of such Project Content on our website or
          socials is not intended to be and shall not be construed as (nor will
          you represent the same to any other third parties as) an endorsement,
          recommendation or validation by us of the Third-Party Project, or any
          views or opinions stated, or the reliability or accuracy of the
          information specified therein. We shall not be liable or responsible
          for any errors or omissions, or for any results obtained from your use
          or reliance of any Project Content. Where such Content includes links
          to third-party sources, please also note that such links and the
          contents stated therein are also not under our control. We shall
          likewise not be responsible for the reliability and accuracy of such
          third-party sites and their contents.
        </p>

        <p className="text-sm">You:</p>
        <ul className="text-sm list-inside list-[lower-alpha] space-y-1 pl-8">
          <li className="pl-4">use and participate in the Testnet;</li>
          <li className="pl-4">use and rely on any Project Content; and </li>
          <li className="pl-4">
            participate in, engage with, and transact with any Third-Party
            Project,{" "}
          </li>
        </ul>

        <p className="text-sm">
          solely at your own risk. Users are solely responsible for their own
          research, due diligence, and investment decisions. Before any such
          reliance or use of the Project Content, or participation, engagement
          or transaction with any Third-Party Project, you are strongly
          encouraged to conduct your independent assessment and due diligence,
          and satisfy yourself as to the legitimacy, authenticity or validity of
          the Third-Party Project. You are solely responsible for your own
          decisions in this regard, and we do not assume any duty of care,
          responsibility or liability for any losses that you may suffer.
        </p>

        <p className="text-sm">
          Users are responsible for their own funds and should understand that
          they may lose some or all of their investment. Please also note that
          digital asset prices can be volatile. The value of your investment may
          go down or up and you may not get back the amount invested. You are
          solely responsible for your investment decisions and the Company is
          not, and will not be, liable or responsible for any losses you may
          incur. The content on our website or our socials shall not be
          construed as financial advice.
        </p>

        <p className="text-sm">
          In addition to the above, by using the Testnet, you acknowledge and
          agree that: 
        </p>
        <ul className="text-sm list-[lower-roman] space-y-4 pl-8">
          <li className="pl-4">
            tokens and transactions accrued or made within the Testnet have no
            actual monetary value and are not legally binding; {" "}
          </li>
          <li className="pl-4">
            the Testnet is provided on an “as-is” and “under development” basis
            and we make no guarantees or warranties in respect of the
            functionality, performance, security or reliability of the Testnet;{" "}
          </li>
          <li className="pl-4">
            We will not be liable to you for any loss or damages arising from or
            in connection with your use of the Testnet; 
          </li>
          <li className="pl-4">
            you will not exploit any security vulnerabilities or bugs detected
            in the Testnet. You will immediately notify us if you detect, become
            aware of, or have a reason to suspect, any security vulnerabilities
            or bugs in the Testnet; 
          </li>
          <li className="pl-4">
            we may, at our sole and absolute discretion, modify or discontinue
            the Testnet at any time; and
          </li>
          <li className="pl-4">
            Where any feedback is provided by you in respect of the performance
            or functionality of the Testnet, we reserves the right to use any
            and all such feedback to improve our products and services without
            any obligation to compensate or acknowledge you in any form.
          </li>
        </ul>
      </div>
      <div className="bg-primary/15 p-3 md:p-6">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Checkbox
              id="terms"
              className="h-5 w-5"
              onCheckedChange={setIsAccepted}
            />
            <label htmlFor="terms" className="text-sm">
              I understand, don&apos;t show this message again.
            </label>
          </div>
          <Button disabled={!isAccepted} onClick={handleOnClose}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
