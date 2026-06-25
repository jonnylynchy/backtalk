import { FC, ReactNode, ButtonHTMLAttributes } from "react";
import styled from "styled-components";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
    action?: string;
}

const StyledButton = styled.button<{ $action?: boolean; }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
`;

const DangerButton = styled(StyledButton)`
    background-color: red;
`;

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
	const { action } = props;
    return action === 'danger' ? (
        <DangerButton {...props}>{children}</DangerButton>
    ) : (
        <StyledButton {...props}>{children}</StyledButton>
    );
};
