import { IconButton } from '~/components/ui/IconButton';
import { classNames } from '~/utils/classNames';
import React, { useState, useRef, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'react-toastify';

// Languages supported for Nigerian context with descriptions
const nigerianLanguages = [
  {
    code: 'en-US',
    name: 'English (US)',
    description: 'Standard American English dialect',
  },
  {
    code: 'en-NG',
    name: 'English (Nigeria)',
    description: 'Nigerian English dialect',
  },
  {
    code: 'ha-Latn-NG',
    name: 'Hausa',
    description: 'Major language in Northern Nigeria (Latin script)',
  },
  {
    code: 'ig-NG',
    name: 'Igbo',
    description: 'Major language in Southeastern Nigeria',
  },
  {
    code: 'pcm-NG',
    name: 'Nigerian Pidgin',
    description: 'Nigerian Creole English, widely spoken across Nigeria',
  },
  {
    code: 'yo-NG',
    name: 'Yoruba',
    description: 'Major language in Southwestern Nigeria',
  },
];

export const SpeechRecognitionButton = ({
  isListening,
  onStart,
  onStop,
  disabled,
  selectedLanguage,
  onLanguageChange,
}: {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLanguageInfo = nigerianLanguages.find((l) => l.code === selectedLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setDropdownVisible(false);
  };

  return (
    <div className="relative flex items-center">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="relative">
              <IconButton
                title={isListening ? 'Stop listening' : 'Start speech recognition'}
                disabled={disabled}
                className={classNames('transition-all', {
                  'text-kofounda-elements-item-contentAccent': isListening,
                })}
                onClick={isListening ? onStop : onStart}
              >
                {isListening ? (
                  <div className="i-ph:microphone-slash text-xl" />
                ) : (
                  <div className="i-ph:microphone text-xl" />
                )}
              </IconButton>

              {isListening && (
                <div className="absolute -bottom-1 -right-1 text-[8px] px-1 bg-kofounda-elements-item-backgroundAccent text-kofounda-elements-item-contentAccent rounded-full">
                  {selectedLanguageInfo?.name.split(' ')[0]}
                </div>
              )}
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-kofounda-elements-background-depth-3 rounded p-2 text-xs text-kofounda-elements-textPrimary border border-kofounda-elements-borderColor shadow-md z-50 max-w-[200px]"
              sideOffset={5}
            >
              <div>
                <p className="font-medium">{selectedLanguageInfo?.name}</p>
                <p className="text-kofounda-elements-textSecondary mt-1">{selectedLanguageInfo?.description}</p>
                {!isListening && (
                  <p className="mt-1 text-kofounda-elements-textTertiary italic">Click to start listening</p>
                )}
              </div>
              <Tooltip.Arrow className="fill-kofounda-elements-borderColor" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <div className="relative">
        <IconButton
          ref={buttonRef}
          title="Select language"
          className={classNames(
            'ml-1 transition-all px-1.5 py-1',
            dropdownVisible ? 'bg-kofounda-elements-item-backgroundActive' : '',
          )}
          onClick={() => {
            setDropdownVisible(!dropdownVisible);
            if (!dropdownVisible) {
              toast.info('Click on a language to select it for speech recognition', {
                position: 'bottom-center',
                autoClose: 3000,
              });
            }
          }}
        >
          <div className="flex items-center">
            <div className="i-ph:globe text-lg mr-1" />
            <span className="text-xs font-medium hidden sm:inline-block">
              {selectedLanguageInfo?.name.split(' ')[0]}
            </span>
            <div className={`i-ph:caret-${dropdownVisible ? 'up' : 'down'} text-xs ml-1`} />
          </div>
        </IconButton>

        {dropdownVisible && (
          <div
            ref={dropdownRef}
            className="fixed md:absolute top-auto md:top-full left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 bottom-20 md:bottom-auto md:mt-1 bg-kofounda-elements-background-depth-2 rounded-md border border-kofounda-elements-borderColor shadow-lg p-1 z-[1000] min-w-[220px]"
          >
            <div className="px-2 py-1 text-xs text-kofounda-elements-textTertiary font-semibold border-b border-kofounda-elements-borderColor mb-1">
              Select Language
            </div>

            {nigerianLanguages.map((lang) => (
              <Tooltip.Provider key={lang.code}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      className={classNames(
                        'w-full text-left px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer flex items-center',
                        selectedLanguage === lang.code
                          ? 'bg-kofounda-elements-item-backgroundActive text-kofounda-elements-item-contentActive'
                          : 'text-kofounda-elements-textPrimary hover:bg-kofounda-elements-item-backgroundDefault',
                      )}
                      onClick={() => {
                        handleLanguageSelect(lang.code);
                        toast.success(`Language changed to ${lang.name}`, {
                          position: 'bottom-center',
                          autoClose: 2000,
                        });
                      }}
                    >
                      {selectedLanguage === lang.code && (
                        <span className="mr-1 text-kofounda-elements-icon-success">✓</span>
                      )}
                      {lang.name}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-kofounda-elements-background-depth-3 rounded p-2 text-xs text-kofounda-elements-textPrimary border border-kofounda-elements-borderColor shadow-md z-50"
                      sideOffset={5}
                    >
                      {lang.description}
                      <Tooltip.Arrow className="fill-kofounda-elements-borderColor" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
