"use client";

import React, { useRef, useState } from "react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import {
  CalendarDays,
  GripVertical,
  Handshake,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";

export const Component = ({ onOpenCard }: { onOpenCard?: (card: CardType) => void }) => {
  return (
    <div className="min-h-[calc(100svh-8rem)] w-full overflow-hidden rounded-lg border border-border bg-slate-50">
      <Board onOpenCard={onOpenCard} />
    </div>
  );
};

const Board = ({ onOpenCard }: { onOpenCard?: (card: CardType) => void }) => {
  const [cards, setCards] = useState(DEFAULT_CARDS);

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto overflow-y-hidden p-4 md:p-6">
      <Column
        title="New Orders"
        column="todo"
        headingColor="text-sky-700"
        accentColor="bg-sky-500"
        cards={cards}
        setCards={setCards}
        onOpenCard={onOpenCard}
      />
      <Column
        title="In Repair"
        column="doing"
        headingColor="text-amber-700"
        accentColor="bg-amber-500"
        cards={cards}
        setCards={setCards}
        onOpenCard={onOpenCard}
      />
      <Column
        title="Ready"
        column="done"
        headingColor="text-emerald-700"
        accentColor="bg-emerald-500"
        cards={cards}
        setCards={setCards}
        onOpenCard={onOpenCard}
      />
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  accentColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onOpenCard?: (card: CardType) => void;
};

const Column = ({
  title,
  headingColor,
  accentColor,
  cards,
  column,
  setCards,
  onOpenCard,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="flex min-h-[34rem] w-[18rem] shrink-0 flex-col rounded-lg border border-white/70 bg-white/75 shadow-sm shadow-slate-200/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${accentColor}`} />
          <h3 className={`text-sm font-semibold ${headingColor}`}>{title}</h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 rounded-b-lg p-3 transition-colors ${
          active ? "bg-slate-200/70" : "bg-transparent"
        }`}
      >
        {filteredCards.map((c) => {
          return (
            <Card
              key={c.id}
              {...c}
              handleDragStart={handleDragStart}
              onOpenCard={onOpenCard}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
      </div>
    </div>
  );
};

type CardProps = CardType & {
  handleDragStart: (e: DragEvent, card: CardType) => void;
  onOpenCard?: (card: CardType) => void;
};

const Card = ({
  title,
  id,
  column,
  client,
  service,
  ticket,
  dueDate,
  priority,
  progress,
  handleDragStart,
  onOpenCard,
}: CardProps) => {
  const dragStartedRef = useRef(false);
  const priorityStyles: Record<CardPriority, string> = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-sky-100 text-sky-700",
    High: "bg-amber-100 text-amber-700",
    Urgent: "bg-rose-100 text-rose-700",
  };
  const cardPayload: CardType = {
    title,
    id,
    column,
    client,
    service,
    ticket,
    dueDate,
    priority,
    progress,
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (dragStartedRef.current) return;
          onOpenCard?.(cardPayload);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenCard?.(cardPayload);
          }
        }}
        className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md hover:ring-4 hover:ring-violet-100 focus-visible:border-violet-400 focus-visible:ring-4 focus-visible:ring-violet-100 active:cursor-grabbing"
      >
        <div
          draggable="true"
          onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
            dragStartedRef.current = true;
            handleDragStart(e, cardPayload);
          }}
          onDragEnd={() => {
            window.setTimeout(() => {
              dragStartedRef.current = false;
            }, 150);
          }}
          className="space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
                {ticket}
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                {title}
              </p>
            </div>
            <GripVertical className="mt-1 size-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
          </div>

          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <UserRound className="size-3.5 text-slate-400" />
              <span className="truncate">{client}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="size-3.5 text-slate-400" />
              <span className="truncate">{service}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-slate-400" />
              <span>{dueDate}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {progress}% complete
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  priorityStyles[priority]
                }`}
              >
                {priority}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-1 h-1 w-full rounded-full bg-sky-400 opacity-0 transition-opacity"
    />
  );
};

const BurnBarrel = ({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-14 grid h-28 w-28 shrink-0 place-content-center rounded-lg border text-3xl shadow-sm transition-colors ${
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-600"
          : "border-slate-200 bg-white/70 text-slate-400"
      }`}
    >
      {active ? (
        <Handshake className="animate-bounce" size={28} />
      ) : (
        <Trash2 size={28} />
      )}
    </div>
  );
};

type ColumnType = "todo" | "doing" | "done";
type CardPriority = "Low" | "Medium" | "High" | "Urgent";

export type CardType = {
  title: string;
  id: string;
  column: ColumnType;
  client: string;
  service: string;
  ticket: string;
  dueDate: string;
  priority: CardPriority;
  progress: number;
};

const DEFAULT_CARDS: CardType[] = [
  {
    title: "Shimano Stradic 4000 reel tune-up",
    id: "1",
    column: "todo",
    client: "Jorge Cortes",
    service: "Reel maintenance",
    ticket: "RO-1048",
    dueDate: "May 18",
    priority: "Medium",
    progress: 15,
  },
  {
    title: "Penn Battle III drag inspection",
    id: "2",
    column: "todo",
    client: "Marta Ruiz",
    service: "Repair reel",
    ticket: "RO-1051",
    dueDate: "May 19",
    priority: "High",
    progress: 10,
  },
  {
    title: "St. Croix rod tip replacement",
    id: "3",
    column: "todo",
    client: "Luis Herrera",
    service: "Repair rod",
    ticket: "RO-1053",
    dueDate: "May 20",
    priority: "Low",
    progress: 5,
  },
  {
    title: "Daiwa BG 3000 bearing replacement",
    id: "4",
    column: "doing",
    client: "Ana Medina",
    service: "Repair reel",
    ticket: "RO-1042",
    dueDate: "May 16",
    priority: "Urgent",
    progress: 55,
  },
  {
    title: "Abu Garcia handle assembly service",
    id: "5",
    column: "doing",
    client: "Carlos Vega",
    service: "Maintenance",
    ticket: "RO-1045",
    dueDate: "May 17",
    priority: "Medium",
    progress: 70,
  },
  {
    title: "Okuma reel cleaning and lubrication",
    id: "6",
    column: "done",
    client: "Sofia Marin",
    service: "Maintenance",
    ticket: "RO-1038",
    dueDate: "May 14",
    priority: "Low",
    progress: 100,
  },
  {
    title: "Ugly Stik guide wrap repair",
    id: "7",
    column: "done",
    client: "Diego Poot",
    service: "Repair rod",
    ticket: "RO-1039",
    dueDate: "May 15",
    priority: "Medium",
    progress: 100,
  },
];

export default Component;
