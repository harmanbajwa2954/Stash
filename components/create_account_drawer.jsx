"use client";
import React, { useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Button } from './ui/button';


const CreateAccountDrawer = ({children}) => {

    const [open, setOpen] = useState(false);
    return (
        <div>
            <Drawer open={open} onOpenChange = {setOpen}>
                <DrawerTrigger asChild>{children}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                    </DrawerHeader>

                    <div>
                        <form action="
                        "></form>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default CreateAccountDrawer
