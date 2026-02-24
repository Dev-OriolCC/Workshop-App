import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";

type NavContext = {
    setNavConfig: React.Dispatch<
        React.SetStateAction<{
            title: string;
            showOrdersTabs: boolean;
        }>
    >;
    showModal: boolean;
    setShowModal: (v: boolean) => void;
};
export default function RepairOrders() {
    const { setNavConfig, showModal, setShowModal } = useOutletContext<NavContext>();

    const [clientName, setClientName] = useState("");
    const [clientNumber, setClientNumber] = useState("");
    const [service, setService] = useState("");
    const [comments, setComments] = useState("");

    const handleCreate = () => {
        const formData = {
            clientName,
            clientNumber,
            service,
            comments,
        };
        console.log("Repair Order Created:", formData);
        // setShowModal(false);

        // // Reset form
        // setClientName("");
        // setClientNumber("");
        // setService("");
        // setComments("");
    };

    useEffect(() => {
        setNavConfig({
            title: "Repair Orders",
            showOrdersTabs: true,
        });

    }, []);

    return (
        <div>
            {showModal && (
                <>
                    <Dialog open={showModal} onClose={() => setShowModal(true)} className="relative z-10">
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-700/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                        />

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    transition
                                    className="bg-white relative transform overflow-hidden rounded-lg text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                >
                                    <div className=" px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="w-full max-w-md">
                                                <form>
                                                    <FieldGroup>
                                                        <FieldSet>
                                                            <FieldLegend>Repair Order</FieldLegend>
                                                            <FieldDescription>
                                                                Enter all information of the Repair Order
                                                            </FieldDescription>
                                                            <FieldGroup>
                                                                <Field>
                                                                    <FieldLabel htmlFor="repairorder-client-name">
                                                                        Client Name
                                                                    </FieldLabel>
                                                                    <Input
                                                                        id="repairorder-client-name"
                                                                        placeholder="Jorge Cortes"
                                                                        required
                                                                        value={clientName}
                                                                        onChange={(e) => setClientName(e.target.value)}
                                                                    />
                                                                </Field>
                                                                <Field>
                                                                    <FieldLabel htmlFor="repairorder-client-number">
                                                                        Client Number
                                                                    </FieldLabel>
                                                                    <Input
                                                                        id="repairorder-client-number"
                                                                        placeholder="9831808283"
                                                                        required
                                                                        value={clientNumber}
                                                                        onChange={(e) => setClientNumber(e.target.value)}
                                                                    />
                                                                    <FieldDescription>
                                                                        Enter phone number
                                                                    </FieldDescription>
                                                                </Field>
                                                                <div className="grid ">
                                                                    <Field>
                                                                        <FieldLabel htmlFor="repairorder-service">
                                                                            Service
                                                                        </FieldLabel>
                                                                        <Select value={service} onValueChange={setService}>
                                                                            <SelectTrigger id="repairorder-service">
                                                                                <SelectValue placeholder="Mantainance" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectGroup>
                                                                                    <SelectItem value="repairReel">Repair Reel</SelectItem>
                                                                                    <SelectItem value="repairRod">Repair Rod</SelectItem>
                                                                                    <SelectItem value="mantainance">Mantainance</SelectItem>
                                                                                    <SelectItem value="repair-point">Repair Point</SelectItem>
                                                                                    <SelectItem value="other">Other</SelectItem>
                                                                                </SelectGroup>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </Field>

                                                                </div>
                                                            </FieldGroup>
                                                        </FieldSet>
                                                        <FieldSet>
                                                            <FieldGroup>
                                                                <Field>
                                                                    <FieldLabel htmlFor="repairorder-comments">
                                                                        Comments
                                                                    </FieldLabel>
                                                                    <Textarea
                                                                        id="repairorder-comments"
                                                                        placeholder="Add any additional comments"
                                                                        value={comments}
                                                                        onChange={(e) => setComments(e.target.value)}
                                                                    />

                                                                </Field>
                                                            </FieldGroup>
                                                        </FieldSet>
                                                    </FieldGroup>
                                                    
                                                    <FieldSeparator />

                                                    <div className="bg-gray-200/25 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                        <Button
                                                            type="submit"
                                                            onClick={handleCreate}
                                                            className="inline-flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 sm:ml-3 sm:w-auto"
                                                        >
                                                            Create
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            data-autofocus
                                                            onClick={() => setShowModal(false)}
                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-red-400 px-3 py-2 text-sm font-semibold text-white inset-ring 
                                                            inset-ring-white/5 hover:bg-red-500 sm:mt-0 sm:w-auto"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>

                                        </div>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                </>
            )
            }
            <p className="text-muted-foreground">Repair Orders content will go here.</p>
            <Outlet />
        </div >
    );
}
