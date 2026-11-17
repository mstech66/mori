"use client";

import React from "react";
import { Zoom } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

interface DialogTransitionProps extends TransitionProps {
  children: React.ReactElement;
}

const DialogTransition = React.forwardRef<unknown, DialogTransitionProps>(
  function Transition(props, ref) {
    return <Zoom in timeout={500} ref={ref} {...props} />;
  }
);

export default DialogTransition;
