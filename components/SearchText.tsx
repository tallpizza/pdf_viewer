// SearchPopover.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export function SearchText({ ...props }) {
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState<{ page: number }[]>([]);
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    if (searchText !== "") {
      const regex = new RegExp(`(${searchText})`, "gi");

      // Clear previous highlights
      document.querySelectorAll(".match").forEach((element) => {
        const parent = element.parentNode as HTMLElement;
        if (parent) {
          parent.innerHTML = parent.textContent || "";
        }
      });

      // Reset matches state
      setTotalMatches([]);
      const matches: { page: number }[] = [];

      const elements = document.querySelectorAll("body *");
      elements.forEach((element) => {
        if (
          element.nodeType === Node.ELEMENT_NODE &&
          element.childElementCount === 0 &&
          element.textContent
        ) {
          const elementMatches = element.textContent.match(regex);
          if (elementMatches) {
            element.innerHTML = element.textContent.replace(regex, (match) => {
              return `<span class="match" data-match-id="${matches.length}">${match}</span>`;
            });

            let parent = element.parentElement;
            while (
              parent !== null &&
              !parent.hasAttribute("data-page-number")
            ) {
              parent = parent.parentElement;
            }

            if (parent !== null) {
              matches.push({
                page: Number(parent.getAttribute("data-page-number")),
              });
            }
          }
        }
      });

      setTotalMatches(matches);
    }
  };

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      setCurrentMatch(1);
      handleSearch();
    }
  }

  function handlePrevMatch() {
    if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  }

  function handleNextMatch() {
    if (currentMatch < totalMatches.length) {
      setCurrentMatch(currentMatch + 1);
    }
  }

  function clear() {
    document
      .querySelectorAll(".match, .current-match-highlight")
      .forEach((element) => {
        element.classList.remove("match", "current-match-highlight");
        element.removeAttribute("data-match-id");
      });
    setSearchText("");
    setCurrentMatch(0);
    setTotalMatches([]);
  }

  useEffect(() => {
    if (currentMatch > 0) {
      // Scroll to the current match
      const page = totalMatches[currentMatch - 1]?.page;

      if (page) {
        const targetElement = document.querySelector(
          `[data-page-number="${page}"]`
        );
        targetElement?.scrollIntoView();

        // Remove highlighting from all matches
        document
          .querySelectorAll(".current-match-highlight")
          .forEach((element) => {
            element.classList.remove("current-match-highlight");
          });

        // Highlight the current match
        const currentMatchElement = document.querySelector(
          `[data-match-id="${currentMatch - 1}"]`
        );

        if (currentMatchElement) {
          currentMatchElement.classList.add("current-match-highlight");
        }
      }
    }
  }, [currentMatch, totalMatches]);

  return (
    <div className="w-80 flex items-center justify-center gap-2 p-2 h-[50px]">
      <Input
        type="text"
        placeholder="검색어 입력"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleInputKeyDown}
        className="flex-1 border-none outline-none text-xs h-full text-black"
      />
      <div className="text-sm text-gray-500">
        {currentMatch}/{totalMatches.length}
      </div>
      <div className="flex">
        <Button
          onClick={handlePrevMatch}
          variant="link"
          size="icon"
          disabled={currentMatch <= 1}
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </Button>
        <Button
          onClick={handleNextMatch}
          disabled={currentMatch >= totalMatches.length}
          variant="ghost"
          size="icon"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </Button>
        <Button
          variant={"ghost"}
          size="icon"
          onClick={() => {
            clear();
          }}
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
