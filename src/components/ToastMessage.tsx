export type MessageProps = {
  title: string;
  content: string | React.ReactNode;
  type?: "success" | "error" | "info" | "warning";
};

export function ToastMessage(props: Readonly<MessageProps>) {
  const { title, content } = props;

  return (
    <div>
      <p className="text-base text-foreground font-bold">{title}</p>
      <div className="text-xs text-foreground">{content}</div>
    </div>
  );
}
